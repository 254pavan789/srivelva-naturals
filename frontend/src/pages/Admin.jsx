import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiHome, FiPackage, FiShoppingCart, FiSettings,
  FiPlus, FiEdit2, FiTrash2, FiX, FiMenu,
  FiUsers, FiDollarSign, FiEye, FiLogOut, FiStar,
  FiLayers, FiAlertTriangle, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getOrders, getSettings, updateSettings, updateOrderStatus, confirmOrder, deleteOrder,
  logoutAdmin, getMe, getReviews, deleteReview,
  getCancelledOrders, updateRefundStatus, updatePaymentStatus,
} from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import brand from '../utils/brandConfig';
import './Admin.css';

// All data fetched from backend API — no hardcoded mock data.
const EMPTY_SETTINGS = { whatsappNumber:'', email:'' };

const TABS = [
  { id:'dashboard',  label:'Dashboard',         icon:<FiHome size={18}/> },
  { id:'products',   label:'Products',           icon:<FiPackage size={18}/> },
  { id:'inventory',  label:'Inventory',          icon:<FiLayers size={18}/> },
  { id:'orders',     label:'Orders',             icon:<FiShoppingCart size={18}/> },
  { id:'cancelled',  label:'Cancelled Orders',   icon:<FiXCircle size={18}/> },
  { id:'reviews',    label:'Reviews',            icon:<FiStar size={18}/> },
  { id:'settings',   label:'Settings',           icon:<FiSettings size={18}/> },
];
const CATEGORIES = ['oils','skin care','hair care','spices'];
const EMPTY_FORM = { name:'', category:'oils', price:'', description:'', stockQuantity:'10' };

/* ─── Stock helpers ─────────────────────────────────────── */
const getStockStatus = (qty) => {
  const q = Number(qty ?? 10);
  if (q > 5)  return 'IN_STOCK';
  if (q > 0)  return 'LOW_STOCK';
  return 'OUT_OF_STOCK';
};
const STOCK_LABEL = { IN_STOCK:'In Stock', LOW_STOCK:'Low Stock', OUT_OF_STOCK:'Out of Stock' };
const STOCK_CLASS = { IN_STOCK:'stock-badge--in', LOW_STOCK:'stock-badge--low', OUT_OF_STOCK:'stock-badge--out' };

export default function Admin() {
  const navigate = useNavigate();
  const { settings: globalSettings, refreshSettings } = useSettings();

  const handleLogout = useCallback(async () => {
    try { await logoutAdmin(); } catch (_) {}
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  const [tab,      setTab]      = useState('dashboard');
  const [sideOpen, setSideOpen] = useState(() => window.innerWidth > 768);
  const [products, setProducts] = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [loading,  setLoading]  = useState(true);

  const [modal,     setModal]     = useState(false);
  const [editMode,  setEditMode]  = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [formErr,   setFormErr]   = useState({});
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(null);

  const [imageFile,        setImageFile]        = useState(null);
  const [imagePreview,     setImagePreview]     = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');

  // Variant management in modal
  const [variants, setVariants] = useState([{ size: '500ml', price: '', stockQuantity: 10 }]);

  const [stForm,   setStForm]   = useState(EMPTY_SETTINGS);
  const [stSaving, setStSaving] = useState(false);

  const [orderDetail,    setOrderDetail]    = useState(null);
  const [statusUpdating,  setStatusUpdating]  = useState(null);
  const [paymentUpdating, setPaymentUpdating] = useState(null);

  const [cancelledOrders,     setCancelledOrders]     = useState([]);
  const [cancelledLoading,    setCancelledLoading]    = useState(false);
  const [refundUpdating,      setRefundUpdating]      = useState(null);
  const [cancelledDetail,     setCancelledDetail]     = useState(null);

  const [allReviews,     setAllReviews]     = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [deletingReview, setDeletingReview] = useState(null);

  /* Inventory inline edit */
  const [invEditId,  setInvEditId]  = useState(null);
  const [invQtyEdit, setInvQtyEdit] = useState('');
  const [invSaving,  setInvSaving]  = useState(false);

  useEffect(() => {
    getMe().catch(() => {});
    Promise.all([
      getProducts().catch(() => ({ data: { data: [] } })),
      getOrders().catch(()   => ({ data: { data: [] } })),
      getSettings().catch(() => ({ data: { data: EMPTY_SETTINGS } })),
    ]).then(([p, o, s]) => {
      const prods = p?.data?.data;
      const ords  = o?.data?.data;
      const sett  = s?.data?.data;
      setProducts(Array.isArray(prods) ? prods : []);
      setOrders(Array.isArray(ords)    ? ords  : []);
      setSettings(sett  || EMPTY_SETTINGS);
      setStForm(sett    || EMPTY_SETTINGS);
    }).finally(() => setLoading(false));
  }, []);

  // Load cancelled orders when that tab is active
  useEffect(() => {
    if (tab !== 'cancelled') return;
    setCancelledLoading(true);
    getCancelledOrders()
      .then(r => setCancelledOrders(Array.isArray(r?.data?.data) ? r.data.data : []))
      .catch(() => setCancelledOrders([]))
      .finally(() => setCancelledLoading(false));
  }, [tab]);

  /* ─── Inventory stats ─── */
  const inStock    = products.filter(p => getStockStatus(p.stockQuantity) === 'IN_STOCK').length;
  const lowStock   = products.filter(p => getStockStatus(p.stockQuantity) === 'LOW_STOCK').length;
  const outOfStock = products.filter(p => getStockStatus(p.stockQuantity) === 'OUT_OF_STOCK').length;

  const revenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const stats = [
    { label:'Total Products', value: products.length,    icon:<FiPackage/>,      color:'#2D5016' },
    { label:'In Stock',       value: inStock,             icon:<FiCheckCircle/>,  color:'#2e7d32' },
    { label:'Out of Stock',   value: outOfStock,          icon:<FiAlertTriangle/>,color:'#c62828' },
    { label:'Low Stock',      value: lowStock,            icon:<FiAlertTriangle/>,color:'#e65100' },
  ];

  /* ─── Inventory inline save ─── */
  const handleInvSave = async (productId) => {
    const qty = parseInt(invQtyEdit, 10);
    if (isNaN(qty) || qty < 0) { toast.error('Enter valid quantity'); return; }
    setInvSaving(true);
    try {
      const p = products.find(x => x.id === productId);
      if (!p) return;
      const fd = new FormData();
      fd.append('name',          p.name);
      fd.append('price',         String(p.price));
      fd.append('description',   p.description);
      fd.append('category',      p.category);
      fd.append('stockQuantity', String(qty));
      await updateProduct(productId, fd);
      setProducts(prev => prev.map(x => x.id === productId ? { ...x, stockQuantity: qty } : x));
      toast.success('Stock updated!');
      setInvEditId(null);
    } catch { toast.error('Failed to update stock.'); }
    finally { setInvSaving(false); }
  };

  const loadAllReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const list = [];
      for (const product of products) {
        try {
          const res = await getReviews(product.id);
          const data = res?.data?.data;
          const reviews = data?.reviews || [];
          reviews.forEach(r => list.push({ ...r, productName: product.name }));
        } catch (_) {}
      }
      setAllReviews(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } finally {
      setReviewsLoading(false);
    }
  }, [products]);

  useEffect(() => {
    if (tab === 'reviews' && products.length > 0 && allReviews.length === 0 && !reviewsLoading) {
      loadAllReviews();
    }
  }, [tab, products, allReviews.length, reviewsLoading, loadAllReviews]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    setDeletingReview(reviewId);
    try {
      await deleteReview(reviewId);
      setAllReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success('Review deleted');
    } catch { toast.error('Failed to delete review'); }
    finally { setDeletingReview(null); }
  };

  const openAdd = () => {
    setForm(EMPTY_FORM); setFormErr({});
    setImageFile(null); setImagePreview(''); setExistingImageUrl('');
    setVariants([{ size: '500ml', price: '', stockQuantity: 10 }]);
    setEditMode(false); setModal(true);
  };
  const openEdit = (p) => {
    setForm({ name:p.name, category:p.category, price:p.price, description:p.description, stockQuantity: p.stockQuantity ?? 10 });
    setImageFile(null); setImagePreview('');
    setExistingImageUrl(p.imageUrl || '');
    setEditId(p.id); setEditMode(true); setFormErr({}); setModal(true);
    // Load existing variants or default from base price
    if (p.variants && p.variants.length > 0) {
      setVariants(p.variants.map(v => ({ id: v.id, size: v.size, price: String(v.price), stockQuantity: v.stockQuantity })));
    } else {
      setVariants([{ size: '500ml', price: String(p.price), stockQuantity: p.stockQuantity ?? 10 }]);
    }
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Enter valid price';
    if (!form.description.trim()) e.description = 'Required';
    return e;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErr(errs); return; }
    setSaving(true);
    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('price', String(Number(form.price)));
    fd.append('description', form.description.trim());
    fd.append('category', form.category);
    fd.append('stockQuantity', String(Number(form.stockQuantity) || 0));
    if (imageFile) fd.append('image', imageFile);
    try {
      if (editMode) {
        await updateProduct(editId, fd);
        toast.success('Product updated!');
      } else {
        await createProduct(fd);
        toast.success('Product added!');
      }
      // Save variants
      const savedProduct = editMode
        ? products.find(p => p.id === editId)
        : (await getProducts().catch(() => null))?.data?.data?.slice(-1)[0];

      const productId = editMode ? editId : savedProduct?.id;
      if (productId && variants.length > 0) {
        const validVariants = variants.filter(v => v.size && v.price && Number(v.price) > 0);
        if (validVariants.length > 0) {
          await replaceVariants(productId, validVariants.map(v => ({
            size: v.size,
            price: Number(v.price),
            stockQuantity: Number(v.stockQuantity) || 10,
          }))).catch(() => {});
        }
      }

      const fresh = await getProducts().catch(() => null);
      const freshList = fresh?.data?.data;
      if (Array.isArray(freshList)) setProducts(freshList);
      setModal(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setDeleting(id);
    await deleteProduct(id).catch(() => {});
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Product deleted.');
    setDeleting(null);
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setStSaving(true);
    try {
      await updateSettings(stForm);
      setSettings(stForm);
      await refreshSettings();
      toast.success('Settings saved!');
    } catch (_) { toast.error('Failed to save settings.'); }
    finally { setStSaving(false); }
  };

  const handleDeleteCancelledOrder = async (orderId) => {
    if (!window.confirm(`Delete cancelled order #${orderId}? This cannot be undone.`)) return;
    try {
      await deleteOrder(orderId);
      setCancelledOrders(prev => prev.filter(o => o.id !== orderId));
      if (cancelledDetail?.id === orderId) setCancelledDetail(null);
      toast.success(`Cancelled order #${orderId} deleted.`);
    } catch (_) { toast.error('Failed to delete cancelled order.'); }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Delete order #${orderId}?`)) return;
    setStatusUpdating(orderId);
    try {
      await deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (orderDetail?.id === orderId) setOrderDetail(null);
      toast.success(`Order #${orderId} deleted.`);
    } catch (_) { toast.error('Failed to delete order.'); }
    finally { setStatusUpdating(null); }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusUpdating(orderId);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      const whatsappUrl = res?.data?.data?.whatsappUrl;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (orderDetail?.id === orderId) setOrderDetail(prev => ({ ...prev, status: newStatus }));
      toast.success(`Order #${orderId} → ${newStatus}`);
      if (whatsappUrl) window.open(whatsappUrl, '_blank');
    } catch (_) { toast.error('Failed to update status.'); }
    finally { setStatusUpdating(null); }
  };

  const handleConfirmOrder = async (orderId) => {
    setStatusUpdating(orderId);
    try {
      const res = await confirmOrder(orderId);
      const whatsappUrl = res?.data?.data?.whatsappUrl;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CONFIRMED' } : o));
      if (orderDetail?.id === orderId) setOrderDetail(prev => ({ ...prev, status: 'CONFIRMED' }));
      toast.success(`Order #${orderId} confirmed!`);
      if (whatsappUrl) window.open(whatsappUrl, '_blank');
    } catch (_) { toast.error('Failed to confirm order.'); }
    finally { setStatusUpdating(null); }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    setPaymentUpdating(orderId);
    try {
      await updatePaymentStatus(orderId, newPaymentStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o));
      if (orderDetail?.id === orderId) setOrderDetail(prev => ({ ...prev, paymentStatus: newPaymentStatus }));
      toast.success(`Payment status → ${newPaymentStatus}`);
    } catch (_) { toast.error('Failed to update payment status.'); }
    finally { setPaymentUpdating(null); }
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f0' }}>
      <div className="spinner"/>
    </div>
  );

  return (
    <div className="admin-layout">
      {/* ══ SIDEBAR ══ */}
      <aside className={`admin-sidebar ${sideOpen ? 'open' : 'collapsed'}`}>

        {/* Logo header */}
        <div className="sidebar-logo">
          {sideOpen ? (
            <div className="sidebar-logo-expanded">
              <img
                src={brand.logoSrc}
                alt={brand.logoAlt}
                className="sidebar-logo-img"
                draggable={false}
              />
              <div className="sidebar-logo-text">
                <span className="sidebar-brand-name">Sri <em>Velva</em></span>
                <span className="sidebar-sub">Admin Panel</span>
              </div>
            </div>
          ) : (
            <img
              src={brand.logoSrc}
              alt={brand.logoAlt}
              className="sidebar-logo-img-mini"
              draggable={false}
            />
          )}
          <button
            className="sidebar-toggle"
            onClick={() => setSideOpen(!sideOpen)}
            aria-label={sideOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <FiMenu size={18}/>
          </button>
        </div>

        <nav className="sidebar-nav">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`sidebar-link ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className="sl-icon">{t.icon}</span>
              {sideOpen && <span className="sl-label">{t.label}</span>}
            </button>
          ))}
        </nav>

        {sideOpen && (
          <div className="sidebar-footer">
            <a href="/" target="_blank" className="view-site-btn">
              <FiEye size={14}/> View Website
            </a>
            <button className="logout-btn" onClick={handleLogout}>
              <FiLogOut size={14}/>
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* ══ MAIN ══ */}
      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-page-title">{TABS.find(t => t.id === tab)?.label}</h1>
          {tab === 'products' && (
            <button className="btn btn-primary" onClick={openAdd}>
              <FiPlus size={16}/> Add Product
            </button>
          )}
        </header>

        <div className="admin-content">

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <div className="dashboard">
              <div className="dash-stats">
                {stats.map(s => (
                  <div key={s.label} className="stat-card" style={{ '--accent': s.color }}>
                    <div className="sc-icon">{s.icon}</div>
                    <div className="sc-val">{s.value}</div>
                    <div className="sc-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="dash-grid">
                <div className="dash-card">
                  <div className="dc-header">
                    <h3>Recent Orders</h3>
                    <button className="link-btn" onClick={() => setTab('orders')}>View All</button>
                  </div>
                  <div className="recent-orders">
                    {orders.slice(0, 4).map(o => (
                      <div key={o.id} className="ro-row">
                        <div className="ro-id">#{o.id}</div>
                        <div className="ro-name">{o.customerName}</div>
                        <div className="ro-amt" style={{fontFamily:"var(--font-body)"}}>₹{o.totalAmount?.toLocaleString('en-IN')}</div>
                        <span className={`ro-status order-status--${(o.status || 'CONFIRMED').toLowerCase()}`}>
                          {o.status || 'CONFIRMED'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="dash-card">
                  <div className="dc-header">
                    <h3>Inventory Summary</h3>
                    <button className="link-btn" onClick={() => setTab('inventory')}>Manage</button>
                  </div>
                  <div className="inv-summary">
                    <div className="inv-sum-row">
                      <span className="inv-sum-dot dot-green"/>
                      <span>In Stock</span>
                      <strong>{inStock} product{inStock !== 1 ? 's' : ''}</strong>
                    </div>
                    <div className="inv-sum-row">
                      <span className="inv-sum-dot dot-orange"/>
                      <span>Low Stock</span>
                      <strong>{lowStock} product{lowStock !== 1 ? 's' : ''}</strong>
                    </div>
                    <div className="inv-sum-row">
                      <span className="inv-sum-dot dot-red"/>
                      <span>Out of Stock</span>
                      <strong>{outOfStock} product{outOfStock !== 1 ? 's' : ''}</strong>
                    </div>
                    {(lowStock > 0 || outOfStock > 0) && (
                      <div className="inv-alert">
                        <FiAlertTriangle size={13}/> {lowStock + outOfStock} item{(lowStock + outOfStock) !== 1 ? 's' : ''} need attention
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {tab === 'products' && (
            <div className="products-admin">
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>#</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => {
                      const status = getStockStatus(p.stockQuantity);
                      return (
                        <tr key={p.id}>
                          <td className="td-num">{i + 1}</td>
                          <td className="td-name">{p.name}</td>
                          <td><span className={`badge badge-${p.category === 'oils' ? 'gold' : 'green'}`}>{p.category}</span></td>
                          <td className="td-price" style={{fontFamily:'var(--font-body)'}}>
                            {p.variants && p.variants.length > 0
                              ? p.variants.map(v => (
                                  <div key={v.id} style={{fontSize:'0.8rem',lineHeight:1.6}}>
                                    <span style={{color:'var(--bark)',fontSize:'0.7rem',marginRight:'4px'}}>{v.size}</span>
                                    ₹{Number(v.price).toLocaleString('en-IN')}
                                  </div>
                                ))
                              : <>₹{Number(p.price).toLocaleString('en-IN')}</>
                            }
                          </td>
                          <td>
                            <span className={`stock-badge ${STOCK_CLASS[status]}`}>
                              {STOCK_LABEL[status]}
                            </span>
                            <span className="stock-qty-tiny">({p.stockQuantity ?? 10})</span>
                          </td>
                          <td className="td-actions">
                            <button className="icon-btn edit-btn" onClick={() => openEdit(p)} title="Edit"><FiEdit2 size={15}/></button>
                            <button className="icon-btn del-btn" onClick={() => handleDelete(p.id)} disabled={deleting === p.id} title="Delete">
                              {deleting === p.id ? '…' : <FiTrash2 size={15}/>}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── INVENTORY ── */}
          {tab === 'inventory' && (
            <div className="inventory-admin">
              <div className="inv-header-row">
                <div className="inv-stat-pills">
                  <span className="inv-pill inv-pill--in"><FiCheckCircle size={13}/> {inStock} In Stock</span>
                  <span className="inv-pill inv-pill--low"><FiAlertTriangle size={13}/> {lowStock} Low Stock</span>
                  <span className="inv-pill inv-pill--out"><FiAlertTriangle size={13}/> {outOfStock} Out of Stock</span>
                </div>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table inventory-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => {
                      const qty    = p.stockQuantity ?? 10;
                      const status = getStockStatus(qty);
                      const isEditing = invEditId === p.id;
                      const imgSrc = p.imageUrl || '/assets/products/default-product.png';
                      return (
                        <tr key={p.id} className={status === 'OUT_OF_STOCK' ? 'row-out-of-stock' : ''}>
                          <td className="td-inv-img">
                            <img
                              src={imgSrc}
                              alt={p.name}
                              className="inv-product-img"
                              onError={e => { e.target.onerror=null; e.target.src='/assets/products/default-product.png'; }}
                            />
                          </td>
                          <td className="td-name">{p.name}</td>
                          <td>
                            <span className={`badge badge-${p.category === 'oils' ? 'gold' : 'green'}`}>
                              {p.category}
                            </span>
                          </td>
                          <td className="td-qty">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                className="qty-input"
                                value={invQtyEdit}
                                onChange={e => setInvQtyEdit(e.target.value)}
                                autoFocus
                                onKeyDown={e => { if (e.key === 'Enter') handleInvSave(p.id); if (e.key === 'Escape') setInvEditId(null); }}
                              />
                            ) : (
                              <span className="qty-display">{qty}</span>
                            )}
                          </td>
                          <td>
                            <span className={`stock-badge ${STOCK_CLASS[status]}`}>
                              {STOCK_LABEL[status]}
                            </span>
                          </td>
                          <td className="td-actions" style={{ display:'flex', gap:'0.4rem', alignItems:'center', flexWrap:'wrap' }}>
                            {isEditing ? (
                              <>
                                <button
                                  className="btn btn-sm btn-primary"
                                  disabled={invSaving}
                                  onClick={() => handleInvSave(p.id)}
                                >
                                  {invSaving ? '…' : 'Save'}
                                </button>
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={() => setInvEditId(null)}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="icon-btn edit-btn"
                                  title="Edit quantity"
                                  onClick={() => { setInvEditId(p.id); setInvQtyEdit(String(qty)); }}
                                >
                                  <FiEdit2 size={15}/>
                                </button>
                                {status === 'OUT_OF_STOCK' ? (
                                  <button
                                    className="btn btn-sm btn-primary"
                                    title="Mark as In Stock (set to 10)"
                                    disabled={invSaving}
                                    onClick={async () => {
                                      setInvSaving(true);
                                      try {
                                        const fd = new FormData();
                                        fd.append('name', p.name);
                                        fd.append('price', String(p.price));
                                        fd.append('description', p.description);
                                        fd.append('category', p.category);
                                        fd.append('stockQuantity', '10');
                                        await updateProduct(p.id, fd);
                                        setProducts(prev => prev.map(x => x.id === p.id ? { ...x, stockQuantity: 10 } : x));
                                        toast.success(`${p.name} marked In Stock`);
                                      } catch { toast.error('Failed to update.'); }
                                      finally { setInvSaving(false); }
                                    }}
                                  >
                                    ✓ In Stock
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-sm"
                                    style={{ background:'#c62828', color:'#fff', border:'none', borderRadius:'6px', padding:'0.25rem 0.6rem', fontSize:'0.75rem', cursor:'pointer' }}
                                    title="Mark as Out of Stock"
                                    disabled={invSaving}
                                    onClick={async () => {
                                      if (!window.confirm(`Mark "${p.name}" as Out of Stock?`)) return;
                                      setInvSaving(true);
                                      try {
                                        const fd = new FormData();
                                        fd.append('name', p.name);
                                        fd.append('price', String(p.price));
                                        fd.append('description', p.description);
                                        fd.append('category', p.category);
                                        fd.append('stockQuantity', '0');
                                        await updateProduct(p.id, fd);
                                        setProducts(prev => prev.map(x => x.id === p.id ? { ...x, stockQuantity: 0 } : x));
                                        toast.success(`${p.name} marked Out of Stock`);
                                      } catch { toast.error('Failed to update.'); }
                                      finally { setInvSaving(false); }
                                    }}
                                  >
                                    Out of Stock
                                  </button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {tab === 'orders' && (
            <div className="orders-admin">
              {orderDetail ? (
                <div className="order-detail-view">
                  <button className="back-btn" onClick={() => setOrderDetail(null)}>← Back to Orders</button>
                  <div className="odv-card">
                    <div className="odv-card-header">
                      <h2>Order #{orderDetail.id}</h2>
                      <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' }}>
                        {(orderDetail.status || 'PENDING') === 'PENDING' && (
                          <button className="btn btn-primary confirm-btn" disabled={statusUpdating === orderDetail.id} onClick={() => handleConfirmOrder(orderDetail.id)}>
                            {statusUpdating === orderDetail.id ? 'Confirming…' : '✓ Confirm Order'}
                          </button>
                        )}
                        <div className="odv-status-wrap">
                          <label className="form-label" style={{ marginBottom:0 }}>Status</label>
                          <select className="status-select" value={orderDetail.status || 'PENDING'} disabled={statusUpdating === orderDetail.id} onChange={e => handleStatusChange(orderDetail.id, e.target.value)}>
                            {['PENDING','CONFIRMED','PAID','SHIPPED','DELIVERED'].map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="odv-grid">
                      <div><strong>Customer:</strong> {orderDetail.customerName}</div>
                      <div><strong>Phone:</strong> {orderDetail.phone}</div>
                      <div><strong>Email:</strong> {orderDetail.email || '—'}</div>
                      <div><strong>Address:</strong> {orderDetail.address}</div>
                      <div><strong>Date:</strong> {orderDetail.createdAt ? new Date(orderDetail.createdAt).toLocaleDateString('en-IN') : '—'}</div>
                      <div><strong>Total:</strong> ₹{orderDetail.totalAmount?.toLocaleString('en-IN')}</div>
                      <div><strong>Payment:</strong> <span className="pay-badge pay-qr">📱 UPI / QR</span></div>
                      <div><strong>Status:</strong> <span className={`order-status order-status--${(orderDetail.status || 'CONFIRMED').toLowerCase()}`}>{orderDetail.status || 'CONFIRMED'}</span></div>
                    </div>
                    {/* UPI / QR Payment Details */}
                    <div className="odv-payment-details">
                      <h3>Payment Details</h3>
                      <div className="odv-grid">
                        <div>
                          <strong>Method:</strong>{' '}
                          <span className="pay-badge pay-qr">📱 UPI / QR Payment</span>
                        </div>
                        <div>
                          <strong>Payment Status:</strong>{' '}
                          <span className={`pay-status-badge pay-status--${(orderDetail.paymentStatus || 'PENDING_VERIFICATION').toLowerCase().replace(/_/g,'-')}`}>
                            {orderDetail.paymentStatus === 'VERIFIED' ? '✅ Verified'
                              : orderDetail.paymentStatus === 'REJECTED' ? '❌ Rejected'
                              : '⏳ Pending Verification'}
                          </span>
                        </div>
                      </div>
                      <div className="odv-pay-actions">
                        <label className="form-label" style={{ marginBottom:0 }}>Update Payment Status</label>
                        <select
                          className="status-select"
                          value={orderDetail.paymentStatus || 'PENDING_VERIFICATION'}
                          disabled={paymentUpdating === orderDetail.id}
                          onChange={e => handlePaymentStatusChange(orderDetail.id, e.target.value)}
                        >
                          <option value="PENDING_VERIFICATION">⏳ Pending Verification</option>
                          <option value="VERIFIED">✅ Verified</option>
                          <option value="REJECTED">❌ Rejected</option>
                        </select>
                      </div>
                    </div>
                    {orderDetail.items?.length > 0 && (
                      <div className="odv-items">
                        <h3>Items</h3>
                        {orderDetail.items.map((it, i) => (
                          <div key={i} className="odv-item">
                            <span>{it.productName}</span>
                            <span>× {it.quantity}</span>
                            <span>₹{(it.price * it.quantity)?.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table orders-table">
                    <thead>
                      <tr><th>ID</th><th>Customer</th><th>Phone</th><th>Email</th><th>Items</th><th>Total</th><th>Payment</th><th>Date</th><th>Status</th><th>Detail</th></tr>
                    </thead>
                    <tbody>
                      {orders.map(o => {
                        const st = (o.status || 'CONFIRMED').toUpperCase();
                        return (
                          <tr key={o.id} className={st === 'PAID' ? 'row-paid' : ''}>
                            <td className="td-num">#{o.id}</td>
                            <td className="td-name"><div>{o.customerName}</div><small className="td-address">{o.address}</small></td>
                            <td>{o.phone}</td>
                            <td className="td-email">{o.email || <span className="muted">—</span>}</td>
                            <td className="td-items">{o.items?.length > 0 ? o.items.map((it,i) => <div key={i} className="item-chip">{it.productName} ×{it.quantity}</div>) : <span className="muted">—</span>}</td>
                            <td className="td-price">₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                            <td><span className="pay-badge pay-qr">📱 UPI</span><br/><span className={`pay-status-badge-sm pay-status--${(o.paymentStatus||'PENDING_VERIFICATION').toLowerCase().replace(/_/g,'-')}`}>{o.paymentStatus === 'VERIFIED' ? '✅' : o.paymentStatus === 'REJECTED' ? '❌' : '⏳'}</span></td>
                            <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                            <td>
                              <select className={`status-select status-select--${st.toLowerCase()}`} value={st} disabled={statusUpdating === o.id} onChange={e => handleStatusChange(o.id, e.target.value)}>
                                {['PENDING','CONFIRMED','PAID','SHIPPED','DELIVERED'].map(s => <option key={s}>{s}</option>)}
                              </select>
                              {st === 'PENDING' && (
                                <button className="btn btn-sm confirm-btn" disabled={statusUpdating === o.id} onClick={() => handleConfirmOrder(o.id)} style={{ marginTop:'0.35rem', width:'100%' }}>
                                  {statusUpdating === o.id ? '…' : '✓ Confirm'}
                                </button>
                              )}
                            </td>
                            <td>
                              <div style={{ display:'flex', gap:'0.35rem', alignItems:'center' }}>
                                <button className="icon-btn edit-btn" title="View details" onClick={() => setOrderDetail(o)}><FiEye size={15}/></button>
                                <button className="icon-btn del-btn" title="Delete order" disabled={statusUpdating === o.id} onClick={() => handleDeleteOrder(o.id)}><FiTrash2 size={15}/></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── CANCELLED ORDERS ── */}
          {tab === 'cancelled' && (
            <div className="cancelled-orders-tab">
              <div className="tab-header">
                <h2><FiXCircle size={20}/> Cancelled Orders</h2>
                <span className="count-badge">{cancelledOrders.length} cancelled</span>
              </div>

              {cancelledLoading ? (
                <div className="loading-state">Loading cancelled orders…</div>
              ) : cancelledDetail ? (
                /* ── Detail view ── */
                <div className="cancelled-detail">
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
                    <button className="back-btn" style={{margin:0}} onClick={() => setCancelledDetail(null)}>← Back</button>
                    <button className="icon-btn del-btn" title="Delete order" style={{display:'flex',alignItems:'center',gap:'6px',padding:'6px 16px',borderRadius:'8px',fontSize:'13px',fontWeight:'600',border:'1.5px solid #fcc',color:'#c0392b',background:'#fff8f8'}} onClick={() => handleDeleteCancelledOrder(cancelledDetail.id)}>
                      <FiTrash2 size={14}/> Delete Order
                    </button>
                  </div>
                  <div className="cancelled-detail-card">
                    <div className="cd-header">
                      <h3>Order #{cancelledDetail.id}</h3>
                      <span className="status-chip cancelled">CANCELLED</span>
                    </div>
                    <div className="cd-grid">
                      <div><strong>Customer:</strong> {cancelledDetail.customerName}</div>
                      <div><strong>Phone:</strong> {cancelledDetail.phone}</div>
                      <div><strong>Email:</strong> {cancelledDetail.email}</div>
                      <div><strong>Total:</strong> ₹{cancelledDetail.totalAmount?.toLocaleString('en-IN')}</div>
                      <div><strong>Ordered:</strong> {cancelledDetail.createdAt ? new Date(cancelledDetail.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}) : '—'}</div>
                      <div><strong>Cancelled:</strong> {cancelledDetail.cancelledAt ? new Date(cancelledDetail.cancelledAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'}</div>
                    </div>
                    <div className="cd-reason">
                      <strong>Cancellation Reason:</strong>
                      <p>{cancelledDetail.cancellationReason || <em>No reason provided</em>}</p>
                    </div>
                    <div className="cd-refund">
                      <strong>Refund Status:</strong>
                      <div className="refund-row">
                        <span className={`refund-chip refund-${(cancelledDetail.refundStatus||'').toLowerCase().replace('_','-')}`}>
                          {cancelledDetail.refundStatus || 'NOT_APPLICABLE'}
                        </span>
                        {cancelledDetail.refundStatus !== 'NOT_APPLICABLE' && (
                          <select
                            className="refund-select"
                            value={cancelledDetail.refundStatus || 'PENDING'}
                            disabled={refundUpdating === cancelledDetail.id}
                            onChange={async (e) => {
                              setRefundUpdating(cancelledDetail.id);
                              try {
                                const r = await updateRefundStatus(cancelledDetail.id, e.target.value);
                                const updated = r?.data?.data;
                                if (updated) {
                                  setCancelledDetail(updated);
                                  setCancelledOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
                                  toast.success('Refund status updated');
                                }
                              } catch { toast.error('Failed to update refund status'); }
                              finally { setRefundUpdating(null); }
                            }}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="INITIATED">Initiated</option>
                            <option value="REFUNDED">Refunded</option>
                          </select>
                        )}
                      </div>
                    </div>
                    {/* Items */}
                    {Array.isArray(cancelledDetail.items) && cancelledDetail.items.length > 0 && (
                      <div className="cd-items">
                        <strong>Items:</strong>
                        <table className="admin-table" style={{marginTop:'0.5rem'}}>
                          <thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead>
                          <tbody>
                            {cancelledDetail.items.map((it,i) => (
                              <tr key={i}>
                                <td>{it.productName}</td>
                                <td>{it.quantity}</td>
                                <td>₹{it.price?.toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ) : cancelledOrders.length === 0 ? (
                <div className="empty-state">
                  <FiCheckCircle size={40} color="#2e7d32"/>
                  <p>No cancelled orders yet.</p>
                </div>
              ) : (
                /* ── List view ── */
                <div className="table-wrap">
                  <table className="admin-table cancelled-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Cancelled On</th>
                        <th>Reason</th>
                        <th>Refund</th>
                        <th>View</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cancelledOrders.map(o => (
                        <tr key={o.id}>
                          <td><strong>#{o.id}</strong></td>
                          <td>{o.customerName}</td>
                          <td>₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                          <td>{o.cancelledAt ? new Date(o.cancelledAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}</td>
                          <td className="reason-cell">{o.cancellationReason || <em className="no-reason">—</em>}</td>
                          <td>
                            <span className={`refund-chip refund-${(o.refundStatus||'').toLowerCase().replace('_','-')}`}>
                              {o.refundStatus === 'NOT_APPLICABLE' ? 'N/A' : (o.refundStatus || 'N/A')}
                            </span>
                          </td>
                          <td>
                            <button className="icon-btn view-btn" title="View details" onClick={() => setCancelledDetail(o)}>
                              <FiEye size={15}/>
                            </button>
                          </td>
                          <td>
                            <button className="icon-btn del-btn" title="Delete" onClick={() => handleDeleteCancelledOrder(o.id)}>
                              <FiTrash2 size={15}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab === 'settings' && (
            <div className="settings-admin">
              <div className="settings-card">
                <h2>Business Settings</h2>
                <p>Update your contact details and configurations.</p>
                <form onSubmit={handleSettingsSave}>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number</label>
                    <div style={{ position:'relative' }}>
                      <span className="phone-prefix">+91</span>
                      <input className="form-input" style={{ paddingLeft:'3.5rem' }} placeholder="9944268288" value={stForm.whatsappNumber || ''} onChange={e => setStForm(p => ({ ...p, whatsappNumber: e.target.value }))} maxLength={10}/>
                    </div>
                    <small style={{ color:'var(--bark)', fontSize:'0.75rem', marginTop:'0.25rem', display:'block' }}>This number receives WhatsApp orders.</small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Business Email</label>
                    <input className="form-input" type="email" placeholder="info@srivelvanaturals.com" value={stForm.email || ''} onChange={e => setStForm(p => ({ ...p, email: e.target.value }))}/>
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={stSaving}>{stSaving ? 'Saving…' : 'Save Settings'}</button>
                </form>
              </div>
              <div className="settings-card">
                <h2>Current Configuration</h2>
                <div className="config-display">
                  <div className="cd-row"><span>WhatsApp</span><strong>+91 {settings.whatsappNumber}</strong></div>
                  <div className="cd-row"><span>Email</span><strong>{settings.email}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* ── REVIEWS ── */}
          {tab === 'reviews' && (
            <div className="admin-reviews-panel">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                <div>
                  <h2 style={{ fontSize:'1.5rem', color:'var(--forest)', fontFamily:'var(--font-display)', fontWeight:500 }}>Customer Reviews</h2>
                  <p style={{ color:'var(--bark)', fontSize:'0.875rem' }}>Manage and delete customer reviews across all products.</p>
                </div>
                <button className="btn btn-primary" onClick={loadAllReviews} disabled={reviewsLoading}>
                  {reviewsLoading ? 'Loading…' : '↻ Load Reviews'}
                </button>
              </div>
              {allReviews.length === 0 && !reviewsLoading && (
                <div style={{ textAlign:'center', padding:'4rem 2rem', color:'var(--bark)' }}>
                  <FiStar size={48} style={{ opacity:0.3, display:'block', margin:'0 auto 1rem' }}/>
                  <p>Click "Load Reviews" to fetch all customer reviews.</p>
                </div>
              )}
              {allReviews.length > 0 && (
                <div className="reviews-admin-list">
                  {allReviews.map(review => (
                    <div key={review.id} className="review-admin-card">
                      <div className="review-admin-meta">
                        <div className="review-admin-avatar">{(review.username || 'A')[0].toUpperCase()}</div>
                        <div>
                          <strong style={{ color:'var(--forest)' }}>{review.username || 'Anonymous'}</strong>
                          <span className="review-product-tag">{review.productName}</span>
                          <div style={{ display:'flex', gap:'2px', marginTop:'2px' }}>
                            {[1,2,3,4,5].map(s => <FiStar key={s} size={13} style={{ color: s <= review.rating ? '#C4951A' : '#ddd', fill: s <= review.rating ? '#C4951A' : 'none' }}/>)}
                          </div>
                        </div>
                        <span className="review-admin-date">{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                      <p className="review-admin-comment">{review.comment}</p>
                      <button className="btn-delete-review" onClick={() => handleDeleteReview(review.id)} disabled={deletingReview === review.id}>
                        <FiTrash2 size={14}/> {deletingReview === review.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ══ PRODUCT MODAL ══ */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}><FiX size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className={`form-input ${formErr.name ? 'input-err' : ''}`} placeholder="e.g. Cold Pressed Sesame Oil" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}/>
                {formErr.name && <span className="field-err">{formErr.name}</span>}
              </div>
              <div className="modal-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input className={`form-input ${formErr.price ? 'input-err' : ''}`} type="number" min="1" placeholder="299" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}/>
                  {formErr.price && <span className="field-err">{formErr.price}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={form.stockQuantity}
                  onChange={e => setForm(p => ({ ...p, stockQuantity: e.target.value }))}
                />
                <small style={{ color:'#888', fontSize:'0.75rem' }}>
                  {Number(form.stockQuantity) > 5 ? '✅ In Stock' : Number(form.stockQuantity) > 0 ? '⚠️ Low Stock' : '🔴 Out of Stock'}
                </small>
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className={`form-input ${formErr.description ? 'input-err' : ''}`} rows={3} placeholder="Describe the product..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize:'vertical' }}/>
                {formErr.description && <span className="field-err">{formErr.description}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Product Image (optional)</label>
                {(imagePreview || existingImageUrl) && (
                  <img src={imagePreview || existingImageUrl} alt="Preview" style={{ width:'100%', maxHeight:'160px', objectFit:'contain', background:'#f6f3ee', borderRadius:'8px', marginBottom:'0.5rem', padding:'8px' }}/>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="form-input" style={{ padding:'0.4rem' }}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setImageFile(file);
                    const reader = new FileReader();
                    reader.onload = ev => setImagePreview(ev.target.result);
                    reader.readAsDataURL(file);
                  }}
                />
                <small style={{ color:'#888', fontSize:'0.75rem' }}>
                  {editMode && existingImageUrl && !imagePreview ? 'Leave blank to keep existing image' : 'JPEG / PNG / WebP — max 5 MB recommended'}
                </small>
              </div>
              {/* ── Variants / Size Pricing ── */}
              <div className="form-group">
                <label className="form-label" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  Size Variants & Pricing
                  <button type="button" style={{fontSize:'0.75rem',color:'var(--forest)',background:'var(--mint)',border:'none',borderRadius:'6px',padding:'3px 10px',cursor:'pointer',fontWeight:600}}
                    onClick={() => setVariants(prev => [...prev, { size: '', price: '', stockQuantity: 10 }])}>
                    + Add Size
                  </button>
                </label>
                <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                  {variants.map((v, idx) => (
                    <div key={idx} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:'0.5rem',alignItems:'center'}}>
                      <input
                        className="form-input"
                        placeholder="Size (e.g. 500ml)"
                        value={v.size}
                        onChange={e => setVariants(prev => prev.map((x,i) => i===idx ? {...x, size: e.target.value} : x))}
                        style={{fontSize:'0.82rem',padding:'0.45rem 0.7rem'}}
                      />
                      <input
                        className="form-input"
                        type="number"
                        placeholder="Price ₹"
                        value={v.price}
                        onChange={e => setVariants(prev => prev.map((x,i) => i===idx ? {...x, price: e.target.value} : x))}
                        style={{fontSize:'0.82rem',padding:'0.45rem 0.7rem'}}
                      />
                      <input
                        className="form-input"
                        type="number"
                        placeholder="Stock"
                        value={v.stockQuantity}
                        onChange={e => setVariants(prev => prev.map((x,i) => i===idx ? {...x, stockQuantity: e.target.value} : x))}
                        style={{fontSize:'0.82rem',padding:'0.45rem 0.7rem'}}
                      />
                      {variants.length > 1 && (
                        <button type="button" style={{background:'#fff0f0',border:'1px solid #fcc',borderRadius:'6px',padding:'0.45rem 0.6rem',cursor:'pointer',color:'#c0392b',fontSize:'1rem',lineHeight:1}}
                          onClick={() => setVariants(prev => prev.filter((_,i) => i!==idx))}>
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <small style={{color:'#888',fontSize:'0.72rem',marginTop:'4px',display:'block'}}>
                  Each size gets its own price. First size is default. Leave empty to skip.
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editMode ? 'Update Product' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
