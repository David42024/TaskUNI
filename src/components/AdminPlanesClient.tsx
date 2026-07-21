"use client";

import { useState, useTransition } from "react";
import { Crown, CheckCircle2, X } from "lucide-react";
import { actualizarPlan } from "@/app/admin/planes/actions";

type PlanCompleto = {
  id_plan: string;
  nombre_plan: string;
  descripcion: string;
  precio_mensual: any;
  tipo_plan: string;
  estado: string;
  suscripciones: any[];
};

export default function AdminPlanesClient({ planes }: { planes: PlanCompleto[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingPlan, setEditingPlan] = useState<PlanCompleto | null>(null);
  const [formData, setFormData] = useState({
    precio_mensual: 0,
    descripcion: "",
    estado: "activo"
  });

  const handleEdit = (plan: PlanCompleto) => {
    setEditingPlan(plan);
    setFormData({
      precio_mensual: Number(plan.precio_mensual),
      descripcion: plan.descripcion,
      estado: plan.estado
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    
    startTransition(() => {
      actualizarPlan(editingPlan.id_plan, {
        precio_mensual: formData.precio_mensual,
        descripcion: formData.descripcion,
        estado: formData.estado
      }).then(() => {
        setEditingPlan(null);
      });
    });
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2 max-w-5xl">
        {planes.map((plan) => (
          <div key={plan.id_plan} className="card relative overflow-hidden group border border-slate-200 dark:border-white/10 hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/5 flex flex-col h-full">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col flex-grow space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    {plan.nombre_plan}
                    {plan.tipo_plan === "premium" && <Crown size={18} className="text-amber-500" />}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{plan.descripcion}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`badge ${plan.tipo_plan === "premium" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300"} capitalize px-3 py-1`}>
                    {plan.tipo_plan}
                  </span>
                  <span className={`badge ${plan.estado === "activo" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"} capitalize`}>
                    {plan.estado}
                  </span>
                </div>
              </div>
              
              <div className="flex-grow">
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    S/ {Number(plan.precio_mensual).toFixed(2)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">/mes</span>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-brand-500" />
                    <span>Suscripciones activas: <strong>{plan.suscripciones.filter((s:any) => s.estado_suscripcion === "activa").length}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-slate-400" />
                    <span>Suscripciones totales: {plan.suscripciones.length}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleEdit(plan)}
                className={`w-full mt-auto py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${plan.tipo_plan === "premium" ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"}`}
              >
                Gestionar Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Editar Plan: {editingPlan.nombre_plan}</h3>
              <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Descripción</label>
                <textarea 
                  className="input min-h-[80px]" 
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Precio Mensual (S/)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    className="input" 
                    value={formData.precio_mensual}
                    onChange={e => setFormData({...formData, precio_mensual: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="label">Estado</label>
                  <select 
                    className="input"
                    value={formData.estado}
                    onChange={e => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingPlan(null)} className="btn-secondary flex-1" disabled={isPending}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={isPending}>
                  {isPending ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
