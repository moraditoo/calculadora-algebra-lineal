// frontend/src/components/MatricesView.tsx
import React, { useState, useEffect } from 'react';
import { postMatrices } from '../services/api';

type TipoOperacion = 
  | 'inversa'
  | 'inversa_de_inversa'
  | 'resolver_por_inversa'
  | 'transponer'
  | 'escalar'
  | 'suma'
  | 'resta'
  | 'multiplicar';

export const MatricesView: React.FC = () => {
  const [opSeleccionada, setOpSeleccionada] = useState<TipoOperacion>('inversa');

  const [fa, setFa] = useState<number>(3);
  const [ca, setCa] = useState<number>(3);
  const [matA, setMatA] = useState<string[][]>([
    ['0', '1', '2'],
    ['1', '0', '3'],
    ['4', '-3', '8']
  ]);

  const [fb, setFb] = useState<number>(3);
  const [cb, setCb] = useState<number>(1);
  const [matB, setMatB] = useState<string[][]>([['3'], ['7'], ['0']]);

  const [escalar, setEscalar] = useState<string>('2');
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

  const requiereVectorB = opSeleccionada === 'resolver_por_inversa';
  const requiereMatrizB = opSeleccionada === 'suma' || opSeleccionada === 'resta' || opSeleccionada === 'multiplicar';
  const requiereEscalar = opSeleccionada === 'escalar';

  useEffect(() => {
    if (requiereVectorB) {
      setFb(fa);
      setCb(1);
      setMatB(Array.from({ length: fa }, (_, i) => [matB[i]?.[0] || '0']));
    } else if (opSeleccionada === 'suma' || opSeleccionada === 'resta') {
      setFb(fa);
      setCb(ca);
      setMatB(Array.from({ length: fa }, (_, i) => 
        Array.from({ length: ca }, (_, j) => matB[i]?.[j] || '0')
      ));
    } else if (opSeleccionada === 'multiplicar') {
      setFb(ca);
      if (cb < 1) setCb(2);
      setMatB(Array.from({ length: ca }, (_, i) => 
        Array.from({ length: cb }, (_, j) => matB[i]?.[j] || '0')
      ));
    }
  }, [opSeleccionada, fa, ca]);

  const estimarTiempo = (n: number) => {
    if (n <= 4) return "< 20 ms (Inmediato)";
    if (n === 5) return "~50 - 100 ms";
    if (n === 6) return "~200 - 400 ms";
    if (n === 7) return "~800 - 1500 ms";
    return "~3 - 6 segundos (Precision Racional)";
  };

  const cambiarDimensionA = (nuevaFila: number, nuevaCol: number) => {
    const f = Math.max(1, Math.min(10, nuevaFila));
    const c = Math.max(1, Math.min(10, nuevaCol));

    const aplicar = () => {
      setFa(f);
      setCa(c);
      setMatA(prev => Array.from({ length: f }, (_, i) => 
        Array.from({ length: c }, (_, j) => prev[i]?.[j] || '0')
      ));
      setResultado(null);
    };

    if (f >= 5 || c >= 5) {
      setAlertaGrande({
        mostrar: true,
        filas: f,
        cols: c,
        tiempoEst: estimarTiempo(Math.max(f, c)),
        accion: () => {
          aplicar();
          setAlertaGrande(prev => ({ ...prev, mostrar: false }));
        }
      });
    } else {
      aplicar();
    }
  };

  const cambiarDimensionB = (nuevaFila: number, nuevaCol: number) => {
    const f = Math.max(1, Math.min(10, nuevaFila));
    const c = Math.max(1, Math.min(10, nuevaCol));

    const aplicar = () => {
      setFb(f);
      setCb(c);
      setMatB(prev => Array.from({ length: f }, (_, i) => 
        Array.from({ length: c }, (_, j) => prev[i]?.[j] || '0')
      ));
      setResultado(null);
    };

    if (f >= 5 || c >= 5) {
      setAlertaGrande({
        mostrar: true,
        filas: f,
        cols: c,
        tiempoEst: estimarTiempo(Math.max(f, c)),
        accion: () => {
          aplicar();
          setAlertaGrande(prev => ({ ...prev, mostrar: false }));
        }
      });
    } else {
      aplicar();
    }
  };

  const advertenciasTeoricas = (): string | null => {
    if (opSeleccionada === 'inversa' || opSeleccionada === 'inversa_de_inversa') {
      if (fa !== ca) {
        return `⚠️ Teorema: La matriz debe ser cuadrada (n × n) para ser invertible. Dimensión actual: ${fa}×${ca}.`;
      }
    }
    if (opSeleccionada === 'resolver_por_inversa') {
      if (fa !== ca) {
        return `⚠️ Teorema: Para aplicar x = A⁻¹b, la matriz A debe ser cuadrada. Dimensión actual: ${fa}×${ca}.`;
      }
      if (fb !== fa || cb !== 1) {
        return `⚠️ El vector b debe ser columna (${fa} × 1).`;
      }
    }
    if (opSeleccionada === 'suma' || opSeleccionada === 'resta') {
      if (fa !== fb || ca !== cb) {
        return `⚠️ Las matrices deben tener dimensiones idénticas: (${fa}×${ca}) vs (${fb}×${cb}).`;
      }
    }
    if (opSeleccionada === 'multiplicar') {
      if (ca !== fb) {
        return `⚠️ Incompatibilidad: Las columnas de A (${ca}) deben coincidir con las filas de B (${fb}).`;
      }
    }
    return null;
  };

  const advertenciaActiva = advertenciasTeoricas();

  const handleEjecutar = async () => {
    setError(null);
    try {
      const data = await postMatrices({
        operacion: opSeleccionada,
        A: matA,
        B: requiereVectorB || requiereMatrizB ? matB : undefined,
        escalar: requiereEscalar ? escalar : undefined,
      });

      if (data.status === 'error') {
        setError(data.mensaje);
        setResultado(null);
      } else {
        setResultado({ op: opSeleccionada, data: data.data });
      }
    } catch (e: any) {
      setError(e.message || 'Error de conexión con el backend en Python');
    }
  };

  // Extraer la dimensión real de los datos calculados (NO del estado mutable fa)
  const dimResultado = resultado?.data?.n || resultado?.data?.inversa?.length || fa;

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
              El cálculo con fracciones exactas posee una complejidad computacional <strong>O(n³)</strong>.
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
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 mb-1">
            Módulo de Matrices & Operaciones Algebraicas
          </h2>
          <p className="text-xs text-slate-500">
            Selecciona la operación deseada; los vectores y matrices secundarias se sincronizan de forma estricta.
          </p>
        </div>

        {/* 1. SELECTOR PRINCIPAL */}
        <div className="bg-white/70 border border-slate-200/90 rounded-2xl p-4 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Seleccione la Operación a Realizar:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'inversa', label: 'Inversa A⁻¹ [A | I]', desc: 'Solo Matriz A' },
              { id: 'inversa_de_inversa', label: '(A⁻¹)⁻¹ = A', desc: 'Solo Matriz A' },
              { id: 'transponer', label: 'Transpuesta (Aᵀ)', desc: 'Solo Matriz A' },
              { id: 'escalar', label: 'Escalar (c × A)', desc: 'Matriz A + Constante' },
              { id: 'resolver_por_inversa', label: 'Resolver x = A⁻¹b', desc: 'Requiere Vector b' },
              { id: 'suma', label: 'Suma (A + B)', desc: 'Requiere Matriz B' },
              { id: 'resta', label: 'Resta (A - B)', desc: 'Requiere Matriz B' },
              { id: 'multiplicar', label: 'Producto (A × B)', desc: 'Requiere Matriz B' },
            ].map((op) => {
              const activo = opSeleccionada === op.id;
              return (
                <button
                  key={op.id}
                  onClick={() => {
                    setOpSeleccionada(op.id as TipoOperacion);
                    setResultado(null);
                    setError(null);
                  }}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    activo
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md translate-y-[-2px]'
                      : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="text-xs font-black">{op.label}</div>
                  <div className={`text-[10px] font-semibold mt-0.5 ${activo ? 'text-slate-300' : 'text-slate-400'}`}>
                    {op.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. ADVERTENCIAS */}
        {advertenciaActiva && (
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-amber-900 text-xs font-bold">
            {advertenciaActiva}
          </div>
        )}

        {/* 3. CONTROLES DE DIMENSIONES */}
        <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2 bg-white/60 p-2.5 rounded-2xl border border-slate-200">
            <span>Dimensión Matriz A:</span>
            <input
              type="number"
              min="1"
              max="10"
              value={fa}
              onChange={(e) => cambiarDimensionA(parseInt(e.target.value) || 1, ca)}
              className="glass-input w-12 text-center py-1 rounded-xl"
            />
            <span>×</span>
            <input
              type="number"
              min="1"
              max="10"
              value={ca}
              onChange={(e) => cambiarDimensionA(fa, parseInt(e.target.value) || 1)}
              className="glass-input w-12 text-center py-1 rounded-xl"
            />
          </div>

          {requiereMatrizB && (
            <div className="flex items-center gap-2 bg-white/60 p-2.5 rounded-2xl border border-slate-200 animate-in fade-in">
              <span>Dimensión Matriz B:</span>
              <input
                type="number"
                min="1"
                max="10"
                value={fb}
                onChange={(e) => cambiarDimensionB(parseInt(e.target.value) || 1, cb)}
                className="glass-input w-12 text-center py-1 rounded-xl"
              />
              <span>×</span>
              <input
                type="number"
                min="1"
                max="10"
                value={cb}
                onChange={(e) => cambiarDimensionB(fb, parseInt(e.target.value) || 1)}
                className="glass-input w-12 text-center py-1 rounded-xl"
              />
            </div>
          )}

          {requiereVectorB && (
            <div className="flex items-center gap-2 bg-purple-50 p-2.5 rounded-2xl border border-purple-200 text-purple-900 animate-in fade-in">
              <span>Vector Columna b:</span>
              <span className="font-mono font-black">{fa} × 1</span>
              <span className="text-[11px] font-semibold text-purple-700">(Sincronizado con filas de A)</span>
            </div>
          )}

          {requiereEscalar && (
            <div className="flex items-center gap-2 bg-white/60 p-2.5 rounded-2xl border border-slate-200 animate-in fade-in">
              <span>Constante Escalar (c):</span>
              <input
                type="text"
                value={escalar}
                onChange={(e) => setEscalar(e.target.value)}
                placeholder="2"
                className="glass-input w-16 text-center py-1 rounded-xl font-bold font-mono"
              />
            </div>
          )}
        </div>

        {/* 4. CUADRÍCULAS DE ENTRADA */}
        <div className="flex flex-wrap gap-8 overflow-x-auto py-3 bg-white/40 p-5 rounded-2xl border border-slate-200/80">
          <div>
            <h4 className="text-xs font-black text-slate-800 mb-2">Matriz A ({fa} × {ca})</h4>
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

          {requiereMatrizB && (
            <div className="border-l border-slate-300 pl-6 animate-in fade-in">
              <h4 className="text-xs font-black text-slate-800 mb-2">Matriz B ({fb} × {cb})</h4>
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
                        className="glass-input w-14 text-center py-1.5 rounded-xl text-xs font-mono font-bold bg-white"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {requiereVectorB && (
            <div className="border-l-2 border-purple-300 pl-6 animate-in fade-in">
              <h4 className="text-xs font-black text-purple-950 mb-2">Vector Objetivo b ({fa} × 1)</h4>
              <div className="space-y-1.5">
                {matB.map((row, i) => (
                  <div key={i} className="flex gap-1.5">
                    <input
                      type="text"
                      value={row[0] || '0'}
                      onChange={(e) => {
                        const copia = [...matB];
                        copia[i] = [e.target.value];
                        setMatB(copia);
                      }}
                      className="glass-input w-16 text-center py-1.5 rounded-xl text-xs font-mono font-black bg-purple-50 text-purple-900 border-purple-300 shadow-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. BOTÓN DE EJECUCIÓN */}
        <div className="pt-2">
          <button
            onClick={handleEjecutar}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl font-black text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all active:scale-[0.98]"
          >
            Ejecutar Operación: {opSeleccionada.toUpperCase().replace(/_/g, ' ')}
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card bg-rose-50 border-rose-200 p-4 rounded-2xl text-rose-800 text-xs font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* 6. RESULTADOS SIN DESFASES DIMENSIONALES */}
      {resultado && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/80 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                      <span className="text-xs font-black text-slate-600 uppercase tracking-wide block">
                        Matriz Inversa A⁻¹ ({dimResultado} × {dimResultado}):
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

                    <div className="bg-white/80 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                      <span className="text-xs font-black text-slate-600 uppercase tracking-wide block">
                        Producto Verificado A · A⁻¹ = I_{dimResultado}:
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

                  {/* Demostración elemento por elemento */}
                  <div className="bg-white/70 border border-slate-200 p-5 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-700">
                      Demostración Analítica del Producto A · A⁻¹ = I_{dimResultado} (Entrada por Entrada):
                    </h4>
                    <div className="space-y-1 font-mono text-xs text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-200 max-h-60 overflow-y-auto">
                      {resultado.data.detalles_verificacion.map((linea: string, idx: number) => (
                        <div key={idx}>{linea}</div>
                      ))}
                    </div>
                  </div>

                  {/* Transformación con divisor de bloque A e I */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-700">
                      Transformación de la Matriz Aumentada [A | I] hacia [I | A⁻¹]:
                    </h4>
                    {resultado.data.pasos_matrices.map(([desc, mat]: any, idx: number) => {
                      const totalCols = mat[0]?.length || (dimResultado * 2);
                      const corteIdentidad = Math.floor(totalCols / 2);

                      return (
                        <div key={idx} className="bg-white/60 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                          <p className="text-xs font-bold text-slate-800">{desc}</p>
                          <div className="flex flex-col gap-1 overflow-x-auto">
                            {mat.map((fila: string[], fi: number) => (
                              <div key={fi} className="flex items-center gap-1.5">
                                {/* Bloque Izquierdo (A) */}
                                {fila.slice(0, corteIdentidad).map((c: string, ci: number) => (
                                  <span
                                    key={ci}
                                    className="w-14 text-center py-1 rounded-lg font-mono text-xs font-bold bg-white text-slate-900 border border-slate-100"
                                  >
                                    {c}
                                  </span>
                                ))}

                                {/* Barra divisoria clara entre [A | I] */}
                                <span className="px-1 text-slate-400 font-black select-none">|</span>

                                {/* Bloque Derecho (Identidad / A^-1) */}
                                {fila.slice(corteIdentidad).map((c: string, ci: number) => (
                                  <span
                                    key={ci + corteIdentidad}
                                    className="w-14 text-center py-1 rounded-lg font-mono text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200"
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CASO: INVERSA DE INVERSA */}
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
                    <span className="text-xs font-bold text-slate-500 uppercase">Vector Solución x = A⁻¹b:</span>
                    <div className="font-mono text-base font-black text-slate-900 mt-1">
                      x = [{resultado.data.x_solucion.join(', ')}]
                    </div>
                  </div>
                  <div className="bg-white/60 p-4 rounded-2xl border border-slate-200 space-y-1 text-xs font-mono text-slate-700">
                    <h4 className="font-sans font-black uppercase text-slate-600 mb-2">Cálculo del Producto A⁻¹ · b:</h4>
                    {resultado.data.pasos_multiplicacion.map((p: string, i: number) => (
                      <div key={i}>{p}</div>
                    ))}
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
                  <h4 className="text-xs font-black uppercase text-slate-500 mb-2">Desglose Analítico Elemento por Elemento:</h4>
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