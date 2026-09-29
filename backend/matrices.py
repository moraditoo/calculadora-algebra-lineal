# matrices.py
from fractions import Fraction
from gauss import format_frac, parse_frac
from gauss_jordan import MetodoGaussJordan

class OperacionesMatrices:
    @staticmethod
    def validar_matriz(mat, nombre="Matriz"):
        if not mat or not isinstance(mat, list):
            raise ValueError(f"{nombre} no tiene un formato válido.")
        filas = len(mat)
        if filas == 0:
            raise ValueError(f"{nombre} no puede estar vacía.")
        cols = len(mat[0])
        if cols == 0:
            raise ValueError(f"{nombre} debe contener al menos una columna.")
        for i, f in enumerate(mat):
            if len(f) != cols:
                raise ValueError(f"{nombre} tiene dimensiones irregulares en la fila {i + 1}.")
        return filas, cols

    @classmethod
    def sumar(cls, A, B):
        fa, ca = cls.validar_matriz(A, "Matriz A")
        fb, cb = cls.validar_matriz(B, "Matriz B")
        if fa != fb or ca != cb:
            raise ValueError(f"Las matrices deben tener dimensiones idénticas para sumarse ({fa}x{ca} vs {fb}x{cb}).")

        pasos = [
            f"Operación: Suma de matrices de orden {fa}x{ca}.",
            "Regla: Se suman las entradas correspondientes (C_ij = A_ij + B_ij)."
        ]
        res = []
        detalles = []
        for i in range(fa):
            fila = []
            for j in range(ca):
                val_a = parse_frac(A[i][j])
                val_b = parse_frac(B[i][j])
                s = val_a + val_b
                fila.append(format_frac(s))
                detalles.append(f"C[{i+1},{j+1}] = ({format_frac(val_a)}) + ({format_frac(val_b)}) = {format_frac(s)}")
            res.append(fila)

        pasos.extend(detalles)
        return {"resultado": res, "pasos": pasos}

    @classmethod
    def restar(cls, A, B):
        fa, ca = cls.validar_matriz(A, "Matriz A")
        fb, cb = cls.validar_matriz(B, "Matriz B")
        if fa != fb or ca != cb:
            raise ValueError(f"Las matrices deben tener dimensiones idénticas para restarse ({fa}x{ca} vs {fb}x{cb}).")

        pasos = [
            f"Operación: Resta de matrices de orden {fa}x{ca}.",
            "Regla: Se restan las entradas correspondientes (C_ij = A_ij - B_ij)."
        ]
        res = []
        detalles = []
        for i in range(fa):
            fila = []
            for j in range(ca):
                val_a = parse_frac(A[i][j])
                val_b = parse_frac(B[i][j])
                r = val_a - val_b
                fila.append(format_frac(r))
                detalles.append(f"C[{i+1},{j+1}] = ({format_frac(val_a)}) - ({format_frac(val_b)}) = {format_frac(r)}")
            res.append(fila)

        pasos.extend(detalles)
        return {"resultado": res, "pasos": pasos}

    @classmethod
    def escalar(cls, c, A):
        fa, ca = cls.validar_matriz(A, "Matriz A")
        c_frac = parse_frac(c)
        pasos = [
            f"Operación: Múltiplo escalar c * A con c = {format_frac(c_frac)}.",
            "Regla: El escalar multiplica cada elemento de la matriz conservando su orden."
        ]
        res = []
        detalles = []
        for i in range(fa):
            fila = []
            for j in range(ca):
                val_a = parse_frac(A[i][j])
                p = c_frac * val_a
                fila.append(format_frac(p))
                detalles.append(f"C[{i+1},{j+1}] = ({format_frac(c_frac)}) * ({format_frac(val_a)}) = {format_frac(p)}")
            res.append(fila)

        pasos.extend(detalles)
        return {"resultado": res, "pasos": pasos}

    @classmethod
    def multiplicar(cls, A, B):
        fa, ca = cls.validar_matriz(A, "Matriz A")
        fb, cb = cls.validar_matriz(B, "Matriz B")
        if ca != fb:
            raise ValueError(f"Incompatibilidad de dimensiones: Columnas de A ({ca}) deben coincidir con Filas de B ({fb}).")

        pasos = [
            f"Operación: Multiplicación de matrices Amxn * Bnxp ({fa}x{ca} * {fb}x{cb} -> {fa}x{cb}).",
            "Regla fila-columna: (AB)_ij = a_i1*b_1j + a_i2*b_2j + ... + a_in*b_nj"
        ]
        res = []
        detalles = []
        for i in range(fa):
            fila = []
            for j in range(cb):
                terminos = []
                suma = Fraction(0)
                for k in range(ca):
                    va = parse_frac(A[i][k])
                    vb = parse_frac(B[k][j])
                    prod = va * vb
                    suma += prod
                    terminos.append(f"({format_frac(va)} * {format_frac(vb)})")
                fila.append(format_frac(suma))
                detalles.append(f"C[{i+1},{j+1}] = " + " + ".join(terminos) + f" = {format_frac(suma)}")
            res.append(fila)

        pasos.extend(detalles)
        return {"resultado": res, "pasos": pasos}

    @classmethod
    def transponer(cls, A):
        fa, ca = cls.validar_matriz(A, "Matriz A")
        pasos = [
            f"Operación: Transpuesta de matriz A ({fa}x{ca} -> {ca}x{fa}).",
            "Regla: Las filas de A se convierten en las columnas correspondientes de A^T (A^T_ji = A_ij)."
        ]
        res = []
        detalles = []
        for j in range(ca):
            fila = []
            for i in range(fa):
                v = parse_frac(A[i][j])
                fila.append(format_frac(v))
                detalles.append(f"A^T[{j+1},{i+1}] = A[{i+1},{j+1}] = {format_frac(v)}")
            res.append(fila)

        pasos.extend(detalles)
        return {"resultado": res, "pasos": pasos}

    @classmethod
    def ecuacion_matricial(cls, A, B_columna):
        fa, ca = cls.validar_matriz(A, "Matriz A")
        fb, cb = cls.validar_matriz(B_columna, "Término b")

        if cb != 1:
            raise ValueError("Para la ecuación Ax = b, 'b' debe ser un vector columna (1 columna).")
        if fb != fa:
            raise ValueError(f"Incompatibilidad de dimensiones: 'b' tiene {fb} filas y 'A' tiene {fa} filas.")

        pasos_teoricos = [
            f"1. Ecuación Matricial planteada: A * x = b con A de orden {fa}x{ca} y b de orden {fb}x1.",
            "2. Construcción de la matriz aumentada del sistema [A | b] para resolver mediante Gauss-Jordan:"
        ]

        matriz = [A[i] + [B_columna[i][0]] for i in range(fa)]
        solver = MetodoGaussJordan()
        pasos_eliminacion, matriz_final = solver.eliminar_gauss_jordan(matriz, fa, ca)
        clasificacion = solver.clasificar_sistema(matriz_final, fa, ca)

        solucion, pasos_detalle = None, []
        if "Determinado" in clasificacion:
            sol, pasos_detalle = solver.extraer_solucion(matriz_final, fa, ca)
            solucion = [format_frac(x) for x in sol]

        return {
            "clasificacion": clasificacion,
            "solucion": solucion,
            "pasos_detalle": pasos_detalle,
            "pasos_teoricos": pasos_teoricos,
            "pasos": pasos_eliminacion
        }