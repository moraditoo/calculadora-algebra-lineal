import React, { useState } from 'react';
import { EcuacionesView } from './components/EcuacionesView';
import { VectoresView } from './components/VectoresView';
import { MatricesView } from './components/MatricesView';
import { ConversorView } from './components/ConversorView';
import { RomanosView } from './components/RomanosView';

export const App: React.FC = () => {
  const [tab, setTab] = useState<'ecuaciones' | 'vectores' | 'matrices' | 'conversor' | 'romanos'>('ecuaciones');

  const menu = [
    { id: 'ecuaciones', label: 'Ecuaciones Lineales' },
    { id: 'vectores', label: 'Vectores Rⁿ' },
    { id: 'matrices', label: 'Matrices & Ax = b' },
    { id: 'conversor', label: 'Sistemas Numéricos' },
    { id: 'romanos', label: 'Números Romanos' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="glass-card w-full max-w-[1240px] h-[90vh] rounded-[28px] flex overflow-hidden shadow-2xl">
        <aside className="w-60 bg-white/40 border-r border-white/80 p-6 flex flex-col justify-between">
          <div>
            <div className="mb-8 px-1">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Álgebra Lineal</h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Calculadora Modular</p>
            </div>

            <nav className="space-y-2">
              {menu.map((item) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                      active
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 translate-x-1'
                        : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 text-slate-800">
          {tab === 'ecuaciones' && <EcuacionesView />}
          {tab === 'vectores' && <VectoresView />}
          {tab === 'matrices' && <MatricesView />}
          {tab === 'conversor' && <ConversorView />}
          {tab === 'romanos' && <RomanosView />}
        </main>
      </div>
    </div>
  );
};

export default App;