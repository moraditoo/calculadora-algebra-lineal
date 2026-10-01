import React, { useState } from 'react';
import { postMatrices } from '../services/api';

export const MatricesView: React.FC = () => {
  const [fa, setFa] = useState(3);
  const [ca, setCa] = useState(3);
  const [fb, setFb] = useState(3);
  const [cb, setCb] = useState(1);
  const [matA, setMatA] = useState<string[][]>([
    ['0', '1', '2'],
    ['1', '0', '3'],
    ['4', '-3', '8']
  ]);
  const [matB, setMatB] = useState<string[][]>([['3'], ['7'], ['0']]);
  const [escalar, setEscalar] = useState('2');
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Estado para la alerta de confirmación en matrices grandes (>= 5)
  const [alertaGrande, setAlertaGrande] = useState<{
    mostrar: boolean;
    filas: number;
    cols: number;
    tiempoEst: string;
    accion: () => void;
  }>({
    mostrar: false,
    filas: 3,
    cols: 3,
    tiempoEst: '',
    accion: () => {},
  });

  const estimarTiempo = (n: number) => {
    // Estimación O(n^3) con aritmética de fracciones exactas BigInt
    if (n <= 4) return "< 15 ms (Inmediato)";
    if (n === 5) return "~45 - 90 ms";
    if (n === 6) return "~150 - 300 ms";
    if (n === 7) return "~600 - 1200 ms";
    if (n === 8) return "~2.5 - 4.5 segundos";
    if (n === 9) return "~7 - 12 segundos";
    return "~20 - 35 segundos (Aritmética racional exacta)";
  };

  const handleCambioDimension = (nuevaFila: number, nuevaCol: number, tipo: 'A' | 'B') => {
    const f = Math.max(1, Math.min(10, nuevaFila));
    const c = Math.max(1, Math.min(10, nuevaCol));

    if (f >= 5 || c >= 5) {
      setAlertaGrande({
        mostrar: true,
        filas: f,
        cols: c,
        tiempoEst: estimarTiempo(Math.max(f, c)),
        accion: () => {
          if (tipo === 'A') {
            setFa(f);
            setCa(c);
            setMatA(Array.from({ length: f }, () => Array(c).fill('0')));
          } else {
            setFb(f);
            setCb(c);
            setMatB(Array.from({ length: f }, () => Array(c).fill('0')));
          }
          setAlertaGrande(prev => ({ ...prev, mostrar: false }));
        }
      });
    } else {
      if (tipo === 'A') {
        setFa(f);
        setCa(c);
        setMatA(Array.from({ length: f }, () => Array(c).fill('0')));
      } else {
        setFb(f);
        setCb(c);
        setMatB(Array.from({ length: f }, () => Array(c).fill('0')));
      }
    }
  };

  const operar = async (op: string) => {
    setError(null);
    try {
      const data = await postMatrices({ operacion: op, A: matA, B: matB, escalar });
      if (data.status === 'error') {
        setError(data.mensaje);
        setResultado(null);
      } else {
        setResultado({ op, data: data.data });
      }
    } catch (e: any) {
      setError(e.message || 'Error de conexión con el backend en Python');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Alerta de confirmación para matrices grandes */}
      {alertaGrande.mostrar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="glass-card bg-white/95 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-300 space-y-4">
            <h3 className="text-base font-black text-amber-800 flex items-center gap-2">
              ⚠️ Alerta de Matriz de Gran Dimensión ({alertaGrande.filas} × {alertaGrande.cols})
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Está solicitando una dimensión de orden superior. Los cálculos con aritmética fraccionaria exacta 
              poseen una complejidad cúbica <strong>O(n³)</strong>.
            </p>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs font-mono font-bold text-amber-900">
              Tiempo estimado de cálculo: {alertaGrande.tiempoEst}
            </div>
            <p className="text-xs font-semibold text-slate-600">
              ¿Desea confirmar esta cantidad y generar la cuadrícula?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAlertaGrande(prev => ({ ...prev, mostrar: false }))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={alertaGrande.accion}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-slate-800 hover:bg-slate-700 shadow-md"
              >
                Confirmar y Generar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor Principal */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-black text-slate-800 mb-2">
          Operaciones Matriciales, Inversa [A | I] y Ecuación Ax = b
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Cálculo exacto mediante eliminación de Gauss-Jordan con comprobación teórica de matrices invertibles.
        </p>

        {/* Selectores de Dimensión */}
        <div className="flex flex-wrap items-center gap-6 mb-4 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2 bg-white/60 p-2.5 rounded-2xl border border-slate-200">
            <span>Matriz A:</span>
            <input
              type="number"
              min="1"
              max="10"
              value={fa}
              onChange={(e) => handleCambioDimension(parseInt(e.target.value) || 1, ca, 'A')}
              className="glass-input w-12 text-center py-1 rounded-xl"
            />
            <span>×</span>
            <input
              type="number"
              min="1"
              max="10"
              value={ca}
              onChange={(e) => handleCambioDimension(fa, parseInt(e.target.value) || 1, 'A')}
              className="glass-input w-12 text-center py-1 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 bg-white/60 p-2.5 rounded-2xl border border-slate-200">
            <span>Matriz B (o vector b):</span>
            <input
              type="number"
              min="1"
              max="10"
              value={fb}
              onChange={(e) => handleCambioDimension(parseInt(e.target.value) || 1, cb, 'B')}
              className="glass-input w-12 text-center py-1 rounded-xl"
            />
            <span>×</span>
            <input
              type="number"
              min="1"
              max="10"
              value={cb}
              onChange={(e) => handleCambioDimension(fb, parseInt(e.target.value) || 1, 'B')}
              className="glass-input w-12 text-center py-1 rounded-xl"
            />
          </div>
        </div>

        {/* Cuadrículas de Entrada */}
        <div className="flex gap-6 overflow-x-auto py-3 bg-white/40 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <h4 className="text-xs font-black text-slate-800 mb-2">Matriz A ({fa}×{ca})</h4>
            <div className="space-y-1.5">
              {matA.map((row, i) => (
                <div key={i} className="flex gap-1.5">
                  {row.map((val, j) => (
                    <input
                      key={j}
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const copia = matA.map((r, ri) =>
                          r.map((cell, cj) => (ri === i && cj === j ? e.target.value : cell))
                        );
                        setMatA(copia);
                      }}
                      className="glass-input w-14 text-center py-1.5 rounded-xl text-xs font-mono font-bold"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-800 mb-2">Matriz B / Vector b ({fb}×{cb})</h4>
            <div className="space-y-1.5">
              {matB.map((row, i) => (
                <div key={i} className="flex gap-1.5">
                  {row.map((val, j) => (
                    <input
                      key={j}
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const copia = matB.map((r, ri) =>
                          r.map((cell, cj) => (ri === i && cj === j ? e.target.value : cell))
                        );
                        setMatB(copia);
                      }}
                      className="glass-input w-14 text-center py-1.5 rounded-xl text-xs font-mono font-bold bg-white/90"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botonera de Operaciones con Teoremas y Gauss-Jordan */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-200 text-xs">
          <button onClick={() => operar('inversa')} className="px-4 py-2 rounded-xl font-black text-white bg-slate-800 hover:bg-slate-700 shadow-md">
            Inversa A⁻¹ [A | I]
          </button>
          <button onClick={() => operar('inversa_de_inversa')} className="glass-pill px-3.5 py-2 rounded-xl font-bold text-slate-800 hover:bg-white">
            (A⁻¹)⁻¹ = A
          </button>
          <button onClick={() => operar('resolver_por_inversa')} className="glass-pill px-3.5 py-2 rounded-xl font-bold text-slate-800 hover:bg-white">
            Resolver x = A⁻¹b
          </button>
          <button onClick={() => operar('transponer')} className="glass-pill px-3.5 py-2 rounded-xl font-bold text-slate-800 hover:bg-white">
            Transpuesta (Aᵀ)
          </button>
          <button onClick={() => operar('suma')} className="glass-pill px-3 py-2 rounded-xl font-bold text-slate-700 hover:bg-white">
            A + B
          </button>
          <button onClick={() => operar('resta')} className="glass-pill px-3 py-2 rounded-xl font-bold text-slate-700 hover:bg-white">
            A - B
          </button>
          <button onClick={() => operar('multiplicar')} className="glass-pill px-3 py-2 rounded-xl font-bold text-slate-700 hover:bg-white">
            A × B
          </button>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-500 font-bold">c:</span>
            <input
              type="text"
              value={escalar}
              onChange={(e) => setEscalar(e.target.value)}
              className="glass-input w-12 text-center py-1.5 rounded-xl text-xs font-bold"
            />
            <button onClick={() => operar('escalar')} className="glass-pill px-3 py-2 rounded-xl font-bold text-slate-700 hover:bg-white">
              c × A
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card bg-rose-50 border-rose-200 p-4 rounded-2xl text-rose-800 text-xs font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* RENDERIZADO CON RESALTADO VISUAL DE RESULTADOS */}
      {resultado && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          {/* CASO: INVERSA DE UNA MATRIZ (GAUSS-JORDAN O EARLY RETURN) */}
          {resultado.op === 'inversa' && (
            <div className="space-y-4">
              {!resultado.data.invertible ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                  <div className="text-xs font-black uppercase text-rose-700">Early Return Teórico Aplicado:</div>
                  <div className="text-sm font-black">{resultado.data.motivo}</div>
                  <p className="text-xs text-rose-800">{resultado.data.detalle}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                    ✓ {resultado.data.motivo}
                  </div>

                  {/* Resaltado de Matriz Inversa Obtenida */}
                  <div className="bg-white/80 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                      Matriz Inversa A⁻¹:
                    </span>
                    <div className="space-y-1.5">
                      {resultado.data.inversa.map((fila: string[], i: number) => (
                        <div key={i} className="flex gap-2">
                          {fila.map((c: string, j: number) => (
                            <span
                              key={j}
                              className="w-16 text-center py-2 rounded-xl font-mono text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-xs"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verificación Obligatoria: A * A^-1 = I */}
                  <div className="bg-white/80 p-5 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wide">
                      Verificación Requerida: Producto A · A⁻¹ = I_{fa}:
                    </span>
                    <div className="space-y-1.5">
                      {resultado.data.verificacion_identidad.map((fila: string[], i: number) => (
                        <div key={i} className="flex gap-2">
                          {fila.map((c: string, j: number) => (
                            <span
                              key={j}
                              className={`w-14 text-center py-1.5 rounded-xl font-mono text-xs font-black ${
                                i === j
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desglose de matrices intermedias Gauss-Jordan */}
                  {resultado.data.pasos_matrices && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-slate-600">
                        Proceso de Reducción Escalonada de la Matriz Aumentada [A | I]:
                      </h4>
                      {resultado.data.pasos_matrices.map(([desc, mat]: any, idx: number) => (
                        <div key={idx} className="bg-white/60 p-3.5 rounded-2xl border border-slate-200/70">
                          <p className="text-xs font-bold text-slate-800 mb-2">{desc}</p>
                          <div className="flex flex-col gap-1 overflow-x-auto">
                            {mat.map((fila: string[], fi: number) => (
                              <div key={fi} className="flex gap-1.5">
                                {fila.map((c: string, ci: number) => (
                                  <span
                                    key={ci}
                                    className={`w-14 text-center py-1 rounded-lg font-mono text-xs font-bold ${
                                      ci >= fa
                                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                                        : 'bg-white text-slate-900'
                                    }`}
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CASO: INVERSA DE LA INVERSA */}
          {resultado.op === 'inversa_de_inversa' && (
            <div className="space-y-4">
              {!resultado.data.invertible ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold">
                  ⚠️ {resultado.data.motivo}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-bold text-xs">
                    ✓ {resultado.data.teorema}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/80 rounded-2xl border border-slate-200">
                      <span className="text-xs font-black text-slate-500 block mb-2">Matriz Inversa A⁻¹:</span>
                      <div className="space-y-1">
                        {resultado.data.A_inversa.map((fila: string[], i: number) => (
                          <div key={i} className="flex gap-1.5">
                            {fila.map((c: string, j: number) => (
                              <span key={j} className="w-14 text-center py-1 bg-slate-100 rounded-lg font-mono text-xs font-bold text-slate-800">
                                {c}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-white/80 rounded-2xl border border-emerald-200">
                      <span className="text-xs font-black text-emerald-800 block mb-2">Inversa de Inversa (A⁻¹)⁻¹:</span>
                      <div className="space-y-1">
                        {resultado.data.A_inversa_de_inversa.map((fila: string[], i: number) => (
                          <div key={i} className="flex gap-1.5">
                            {fila.map((c: string, j: number) => (
                              <span key={j} className="w-14 text-center py-1 bg-emerald-100 border border-emerald-300 rounded-lg font-mono text-xs font-black text-emerald-950">
                                {c}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CASO: RESOLVER Ax = b POR x = A^-1 * b */}
          {resultado.op === 'resolver_por_inversa' && (
            <div className="space-y-4">
              {!resultado.data.resuelto ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs font-bold">
                  ⚠️ {resultado.data.motivo} - {resultado.data.detalle}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-bold text-xs">
                    ✓ {resultado.data.teorema}
                  </div>
                  <div className="p-4 bg-white/90 border border-slate-200 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase">Vector Solución x = A⁻¹b:</span>
                    <div className="font-mono text-base font-black text-slate-900 mt-1">
                      x = [{resultado.data.x_solucion.join(', ')}]
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CASO GENERAL: SUMA, RESTA, ESCALAR, TRANSPUESTA, MULTIPLICACIÓN */}
          {resultado.data.resultado && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-500 mb-2">Matriz Resultante:</h4>
                <div className="space-y-1.5">
                  {resultado.data.resultado.map((fila: string[], i: number) => (
                    <div key={i} className="flex gap-2">
                      {fila.map((val: string, j: number) => (
                        <span key={j} className="w-16 text-center py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-black text-slate-900 shadow-xs">
                          {val}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {resultado.data.pasos && (
                <div className="bg-white/60 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="text-xs font-black uppercase text-slate-500 mb-2">Desglose Analítico Paso a Paso:</h4>
                  {resultado.data.pasos.map((line: string, i: number) => (
                    <p key={i} className="font-mono text-xs text-slate-700">{line}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};