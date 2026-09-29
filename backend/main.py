# main.py
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
from gauss import MetodoGauss, format_frac
from gauss_jordan import MetodoGaussJordan
from metodo_pivote import MetodoPivote
from parser_ecuaciones import parse_ecuaciones
from vectores import OperacionesVectores
from matrices import OperacionesMatrices
from conversor import ConversorSistemas
from romanos import OperacionesRomanos

app = Flask(__name__)
CORS(app)


@app.route("/api/ecuaciones", methods=["POST"])
def resolver_ecuaciones():
    data = request.json
    modo = data.get("modo", "cuadricula")
    metodo = data.get("metodo", "gauss_jordan")
    try:
        if modo == "texto":
            matriz, m, n, vars_names = parse_ecuaciones(data.get("texto", ""))
        else:
            matriz = data.get("matriz", [])
            m = len(matriz)
            n = len(matriz[0]) - 1
            vars_names = [f"x_{i+1}" for i in range(n)]

        if metodo == "gauss":
            solver = MetodoGauss()
            pasos, mat_final = solver.eliminar(matriz, m, n)
            solucion, detalle = (
                solver.resolver_sustitucion_atras(mat_final, m, n)
                if "Determinado" in solver.clasificar_sistema(mat_final, m, n)
                else (None, [])
            )
        elif metodo == "pivote":
            solver = MetodoPivote()
            pasos, mat_final = solver.resolver_por_pivote(matriz, m, n)
            solucion, detalle = (
                solver.resolver_sustitucion_atras(mat_final, m, n)
                if "Determinado" in solver.clasificar_sistema(mat_final, m, n)
                else (None, [])
            )
        else:
            solver = MetodoGaussJordan()
            pasos, mat_final = solver.eliminar_gauss_jordan(matriz, m, n)
            solucion, detalle = (
                solver.extraer_solucion(mat_final, m, n)
                if "Determinado" in solver.clasificar_sistema(mat_final, m, n)
                else (None, [])
            )

        clasificacion = solver.clasificar_sistema(mat_final, m, n)
        verificacion = (
            solver.verificar_solucion(matriz, solucion, m, n) if solucion else []
        )
        sol_dict = (
            {vars_names[i]: format_frac(solucion[i]) for i in range(n)}
            if solucion
            else None
        )

        return jsonify({
            "status": "success",
            "pasos": pasos,
            "clasificacion": clasificacion,
            "solucion": sol_dict,
            "detalle_solucion": detalle,
            "verificacion": verificacion
        })
    except Exception as e:
        return jsonify({"status": "error", "mensaje": str(e)}), 400


@app.route("/api/vectores", methods=["POST"])
def api_vectores():
    data = request.json
    op = data.get("operacion")
    try:
        if op == "suma":
            res = OperacionesVectores.suma(data["v1"], data["v2"])
            return jsonify({"status": "success", "data": res})
        elif op == "resta":
            res = OperacionesVectores.resta(data["v1"], data["v2"])
            return jsonify({"status": "success", "data": res})
        elif op == "escalar":
            res = OperacionesVectores.producto_escalar(data["escalar"], data["v1"])
            return jsonify({"status": "success", "data": res})
        elif op == "combinacion":
            res = OperacionesVectores.combinacion_lineal(data["vectores"], data["b"])
            return jsonify({"status": "success", "data": res})
        else:
            raise ValueError(f"Operación '{op}' no reconocida.")
    except Exception as e:
        return jsonify({"status": "error", "mensaje": str(e)}), 400


@app.route("/api/matrices", methods=["POST"])
def api_matrices():
    data = request.json
    op = data.get("operacion")
    try:
        if op == "suma":
            res = OperacionesMatrices.sumar(data["A"], data["B"])
            return jsonify({"status": "success", "data": res})
        elif op == "resta":
            res = OperacionesMatrices.restar(data["A"], data["B"])
            return jsonify({"status": "success", "data": res})
        elif op == "escalar":
            res = OperacionesMatrices.escalar(data["escalar"], data["A"])
            return jsonify({"status": "success", "data": res})
        elif op == "multiplicar":
            res = OperacionesMatrices.multiplicar(data["A"], data["B"])
            return jsonify({"status": "success", "data": res})
        elif op == "ecuacion":
            res = OperacionesMatrices.ecuacion_matricial(data["A"], data["B"])
            return jsonify({"status": "success", "data": res})
        else:
            raise ValueError(f"Operación '{op}' no reconocida.")
    except Exception as e:
        return jsonify({"status": "error", "mensaje": str(e)}), 400


@app.route("/api/conversor", methods=["POST"])
def api_conversor():
    data = request.json
    try:
        res = ConversorSistemas.convertir(data["numero"], data["origen"], data["destino"])
        return jsonify({"status": "success", "data": res})
    except Exception as e:
        return jsonify({"status": "error", "mensaje": str(e)}), 400


@app.route("/api/romanos", methods=["POST"])
def api_romanos():
    data = request.json
    op = data.get("operacion")
    try:
        if op == "suma":
            res = OperacionesRomanos.suma(data["a"], data["b"])
            return jsonify({"status": "success", "data": res})
        elif op == "resta":
            res = OperacionesRomanos.resta(data["a"], data["b"])
            return jsonify({"status": "success", "data": res})
        elif op == "multiplicar":
            res = OperacionesRomanos.multiplicacion(data["a"], data["b"])
            return jsonify({"status": "success", "data": res})
        elif op == "convertir":
            res = OperacionesRomanos.convertir_simple(data["entrada"])
            return jsonify({"status": "success", "data": res})
        else:
            raise ValueError(f"Operación '{op}' no reconocida.")
    except Exception as e:
        return jsonify({"status": "error", "mensaje": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)