// frontend/src/components/MatricesView.tsx
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
    if (n <= 4) return "< 20 ms (Inmediato)";
    if (n === 5) return "~50 - 100 ms";
    if (n === 6) return "~200 - 400 ms";
    if (n === 7) return "~800 - 1500 ms";
    if (n === 8) return "~3 - 5 segundos";
    return "~15 - 30 segundos (Precision Racional Exacta)";
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
      setError(e.message || 'Error de conexion con el servidor Python');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Modal para matrices grandes */}
      {alertaGrande.mostrar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="glass-card bg-white/95 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-300 space-y-4">
            <h3 className="text-base font-black text-amber-800 flex items-center gap-2">
              ⚠️ Alerta de Complejidad: Matriz {alertaGrande.filas} × {alertaGrande.cols}
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              El calculo con fracciones exactas posee una complejidad computacional <strong>O(n³)</strong>.
            </p>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs font-mono font-bold text-amber-900">
              Tiempo estimado de calculo: {alertaGrande.tiempoEst}
            </div>
            <p className="text-xs font-semibold text-slate-600">
              ¿Desea confirmar esta cantidad y generar la cuadricula?
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

      {/* Contenedor principal de controles */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-black text-slate-800 mb-2">
          Modulo de Matrices & Inversa por Gauss-Jordan
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Operaciones fundamentales, determinacion de A⁻¹ mediante [A | I], teoremas de invertibilidad y comprobacion formal.
        </p>

        {/* Selectores de dimensiones */}
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
            <span>Matriz B / Vector b:</span>
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

        {/* Cuadriculas de entrada */}
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

        {/* Botonera de acciones */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-200 text-xs">
          <button onClick={() => operar('inversa')} className="px-4 py-2 rounded-xl font-black text-white bg-slate-800 hover:bg-slate-700 shadow-md">
            Inversa A⁻¹ [A | I]
          </button>
          <button onClick={() => operar('inversa_de_inversa')} className="glass-pill px-3.5 py-2 rounded-xl font-bold text-slate-800 hover:bg-white shadow-xs">
            (A⁻¹)⁻¹ = A
          </button>
          <button onClick={() => operar('resolver_por_inversa')} className="glass-pill px-3.5 py-2 rounded-xl font-bold text-slate-800 hover:bg-white shadow-xs">
            Resolver x = A⁻¹b
          </button>
          <button onClick={() => operar('transponer')} className="glass-pill px-3.5 py-2 rounded-xl font-bold text-slate-800 hover:bg-white shadow-xs">
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

      {/* Resultados y Procedimientos Paso a Paso */}
      {resultado && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          {/* CASO: INVERSA A^-1 */}
          {resultado.op === 'inversa' && (
            <div className="space-y-6">
              {!resultado.data.invertible ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                  <div className="text-xs font-black uppercase text-rose-700">Early Return Teórico Aplicado:</div>
                  <div className="text-sm font-black">{resultado.data.motivo}</div>
                  <p className="text-xs text-rose-800">{resultado.data.detalle}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                    ✓ {resultado.data.motivo}
                  </div>

                  {/* Matrices resultantes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Matriz inversa */}
                    <div className="bg-white/80 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                      <span className="text-xs font-black text-slate-600 uppercase tracking-wide block">
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

                    {/* Matriz identidad verificada */}
                    <div className="bg-white/80 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                      <span className="text-xs font-black text-slate-600 uppercase tracking-wide block">
                        Resultado del Producto A · A⁻¹ = I_{fa}:
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
                  </div>

                  {/* DESGLOSE DETALLADO: CÓMO SE MULTIPLICÓ A * A^-1 PARA OBTENER LA IDENTIDAD */}
                  <div className="bg-white/70 border border-slate-200 p-5 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-700">
                      Demostración Analítica del Producto A · A⁻¹ = I (Fila por Columna entrada por entrada):
                    </h4>
                    <div className="space-y-1 font-mono text-xs text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                      {resultado.data.detalles_verificacion.map((linea: string, idx: number) => (
                        <div key={idx}>{linea}</div>
                      ))}
                    </div>
                  </div>

                  {/* PROCESO DE GAUSS-JORDAN PASO POR PASO EN [A | I] */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-700">
                      Transformación Escalonada de la Matriz Aumentada [A | I] hacia [I | A⁻¹]:
                    </h4>
                    {resultado.data.pasos_matrices.map(([desc, mat]: any, idx: number) => (
                      <div key={idx} className="bg-white/60 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                        <p className="text-xs font-bold text-slate-800">{desc}</p>
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
                </div>
              )}
            </div>
          )}

          {/* CASO: (A^-1)^-1 = A */}
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
                      <span className="text-xs font-black text-slate-500 block mb-2">Primera Inversa A⁻¹:</span>
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
                      <span className="text-xs font-black text-emerald-800 block mb-2">Inversa de la Inversa (A⁻¹)⁻¹:</span>
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

          {/* CASO: RESOLVER x = A^-1 * b */}
          {resultado.op === 'resolver_por_inversa' && (
            <div className="space-y-4">
              {!resultado.data.resuelto ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs font-bold">
                  ⚠️ {resultado.data.motivo} - {resultado.data.detalle}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-bold text-xs">
                    ✓ {resultado.data.teorema}
                  </div>
                  <div className="p-4 bg-white/90 border border-slate-200 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase">Vector Solucion x = A⁻¹b:</span>
                    <div className="font-mono text-base font-black text-slate-900 mt-1">
                      x = [{resultado.data.x_solucion.join(', ')}]
                    </div>
                  </div>
                  <div className="bg-white/60 p-4 rounded-2xl border border-slate-200 space-y-1 text-xs font-mono text-slate-700">
                    <h4 className="font-sans font-black uppercase text-slate-600 mb-2">Calculo del Producto A⁻¹ · b:</h4>
                    {resultado.data.pasos_multiplicacion.map((p: string, i: number) => (
                      <div key={i}>{p}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CASO GENERAL: SUMA, RESTA, ESCALAR, TRANSPUESTA, MULTIPLICACION */}
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
                  <h4 className="text-xs font-black uppercase text-slate-500 mb-2">Desglose Analitico Elemento por Elemento:</h4>
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