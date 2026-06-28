import { X, Package, ShoppingBag, User, MapPin, Calendar, CreditCard, Printer, CheckCircle2, XCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';

export default function OrderDetailsModal({ open, onClose, order }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal open={open} onClose={onClose} title="Order & Invoice Details" size="lg">
      <div className="p-8 font-inter bg-slate-50/30 print:bg-white print:p-0">
        
        {/* Header / Brand */}
        <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">INVOICE</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">#{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-brand-green uppercase">Tonus Club</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{order.branch?.name || 'Main Branch'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          {/* Billing Info */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User className="w-3 h-3" /> Billed To
            </h4>
            <div>
              <p className="text-sm font-black text-slate-900">{order.member?.firstName} {order.member?.lastName}</p>
              <p className="text-[11px] font-bold text-slate-500">{order.member?.email || 'No email provided'}</p>
              <p className="text-[11px] font-bold text-slate-500">{order.member?.phone}</p>
            </div>
          </div>

          {/* Order Meta */}
          <div className="space-y-4 text-right">
            <div className="flex flex-col items-end gap-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Status</h4>
              <StatusBadge status={order.status} />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date Issued</h4>
              <p className="text-[11px] font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm mb-8">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Description</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {/* Membership Package */}
              {order.package && (
                <tr className="group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 uppercase text-[11px] tracking-tight">{order.package.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Main Membership Plan</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-slate-600">1</td>
                  <td className="px-6 py-5 text-right font-bold text-slate-600">EGP {Number(order.package.price).toLocaleString()}</td>
                  <td className="px-6 py-5 text-right font-black text-slate-900">EGP {Number(order.package.price).toLocaleString()}</td>
                </tr>
              )}

              {/* Add-on Products */}
              {order.items?.map(item => (
                <tr key={item.id} className="group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 uppercase text-[11px] tracking-tight">{item.product?.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Retail Add-on</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-slate-600">{item.quantity}</td>
                  <td className="px-6 py-5 text-right font-bold text-slate-600">EGP {Number(item.price).toLocaleString()}</td>
                  <td className="px-6 py-5 text-right font-black text-slate-900">EGP {(Number(item.price) * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-3">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase">
              <span>Subtotal</span>
              <span>EGP {Number(order.subtotal).toLocaleString()}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between items-center text-[11px] font-bold text-red-500 uppercase">
                <span>Discount Applied</span>
                <span>- EGP {Number(order.discount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <span className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Total Amount</span>
              <span className="text-xl font-black text-brand-green">EGP {Number(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
              {order.status === 'PAID' ? <CheckCircle2 className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
              {order.status}
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button 
              onClick={handlePrint}
              className="px-6 h-11 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-200"
            >
              <Printer className="w-3.5 h-3.5" /> Print Invoice
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
}
