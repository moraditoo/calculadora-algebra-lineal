# matrices.py
from fractions import Fraction
from gauss import format_frac, parse_frac

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
            raise ValueError(f"Las matrices deben tener dimensiones idénticas ({fa}x{ca} vs {fb}x{cb}).")

        pasos = [
            f"Operación: Suma de matrices de orden {fa}x{ca}.",
            "Regla: C_ij = A_ij + B_ij componente a componente."
        ]
        res = []
        for i in range(fa):
            fila = []
            for j in range(ca):
                s = parse_frac(A[i][j]) + parse_frac(B[i][j])
                fila.append(format_frac(s))
                pasos.append(f"C[{i+1},{j+1}] = ({format_frac(A[i][j])}) + ({format_frac(B[i][j])}) = {format_frac(s)}")
            res.append(fila)
        return {"resultado": res, "pasos": pasos}

    @classmethod
    def restar(cls, A, B):
        fa, ca = cls.validar_matriz(A, "Matriz A")
        fb, cb = cls.validar_matriz(B, "Matriz B")
        if fa != fb or ca != cb:
            raise ValueError(f"Las matrices deben tener dimensiones idénticas ({fa}x{ca} vs {fb}x{cb}).")

        pasos = [
            f"Operación: Resta de matrices de orden {fa}x{ca}.",
            "Regla: C_ij = A_ij - B_ij componente a componente."
        ]
        res = []
        for i in range(fa):
            fila = []
            for j in range(ca):
                r = parse_frac(A[i][j]) - parse_frac(B[i][j])
                fila.append(format_frac(r))
                pasos.append(f"C[{i+1},{j+1}] = ({format_frac(A[i][j])}) - ({format_frac(B[i][j])}) = {format_frac(r)}")
            res.append(fila)
        return {"resultado": res, "pasos": pasos}

    @classmethod
    def escalar(cls, c, A):
        fa, ca = cls.validar_matriz(A, "Matriz A")
        c_frac = parse_frac(c)
        pasos = [
            f"Operación: Múltiplo escalar c * A con c = {format_frac(c_frac)}.",
            "Regla: Multiplica cada elemento de la matriz por el escalar."
        ]
        res = []
        for i in range(fa):
            fila = []
            for j in range(ca):
                p = c_frac * parse_frac(A[i][j])
                fila.append(format_frac(p))
                pasos.append(f"C[{i+1},{j+1}] = ({format_frac(c_frac)}) * ({format_frac(A[i][j])}) = {format_frac(p)}")
            res.append(fila)
        return {"resultado": res, "pasos": pasos}

    @classmethod
    def multiplicar(cls, A, B):
        fa, ca = cls.validar_matriz(A, "Matriz A")
        fb, cb = cls.validar_matriz(B, "Matriz B")
        if ca != fb:
            raise ValueError(f"Incompatibilidad: Columnas de A ({ca}) deben ser iguales a Filas de B ({fb}).")

        pasos = [
            f"Operación: Multiplicación de matrices ({fa}x{ca} * {fb}x{cb} -> {fa}x{cb}).",
            "Regla fila por columna: C_ij = Sumatoria(A_ik * B_kj)."
        ]
        res = []
        for i in range(fa):
            fila = []
            for j in range(cb):
                suma = Fraction(0)
                terminos = []
                for k in range(ca):
                    va = parse_frac(A[i][k])
                    vb = parse_frac(B[k][j])
                    prod = va * vb
                    suma += prod
                    terminos.append(f"({format_frac(va)}*{format_frac(vb)})")
                fila.append(format_frac(suma))
                pasos.append(f"C[{i+1},{j+1}] = {' + '.join(terminos)} = {format_frac(suma)}")
            res.append(fila)
        return {"resultado": res, "pasos": pasos}

    @classmethod
    def transponer(cls, A):
        fa, ca = cls.validar_matriz(A, "Matriz A")
        pasos = [
            f"Operación: Transpuesta de matriz A ({fa}x{ca} -> {ca}x{fa}).",
            "Teorema / Definición: Las filas de A se transforman en las columnas de A^T (A^T_ji = A_ij)."
        ]
        res = []
        for j in range(ca):
            fila = []
            for i in range(fa):
                val = parse_frac(A[i][j])
                fila.append(format_frac(val))
                pasos.append(f"A^T[{j+1},{i+1}] = A[{i+1},{j+1}] = {format_frac(val)}")
            res.append(fila)
        return {"resultado": res, "pasos": pasos}

    # =========================================================================
    # INVERSA DE UNA MATRIZ CON EARLY RETURNS TEÓRICOS Y GAUSS-JORDAN [A | I]
    # =========================================================================
    @classmethod
    def calcular_inversa_gauss_jordan(cls, A_raw):
        fa, ca = cls.validar_matriz(A_raw, "Matriz A")

        # -------------------------------------------------------------
        # EARLY RETURN 1: Teorema - La matriz DEBE ser cuadrada (n x n)
        # -------------------------------------------------------------
        if fa != ca:
            return {
                "invertible": False,
                "motivo": "TEOREMA: La matriz debe ser estrictamente cuadrada (n x n) para tener inversa.",
                "detalle": f"La matriz ingresada tiene orden {fa}x{ca}. No puede existir una matriz C tal que AC = I y CA = I.",
                "pasos": [f"Early Return: Matriz no cuadrada ({fa}x{ca}). Operación abortada."]
            }

        n = fa
        A = [[parse_frac(val) for val in fila] for fila in A_raw]

        # -------------------------------------------------------------
        # EARLY RETURN 2: Filas o Columnas compuestas solo por ceros
        # -------------------------------------------------------------
        for i in range(n):
            if all(A[i][j] == 0 for j in range(n)):
                return {
                    "invertible": False,
                    "motivo": "TEOREMA DE LA MATRIZ INVERTIBLE: Fila nula detectada.",
                    "detalle": f"La fila {i+1} es completamente cero. A no puede tener {n} posiciones pivote.",
                    "pasos": [f"Early Return: La Fila {i+1} contiene solo ceros. det(A) = 0. Matriz singular."]
                }
        for j in range(n):
            if all(A[i][j] == 0 for i in range(n)):
                return {
                    "invertible": False,
                    "motivo": "TEOREMA DE LA MATRIZ INVERTIBLE: Columna nula detectada.",
                    "detalle": f"La columna {j+1} es completamente cero. Las columnas no son linealmente independientes.",
                    "pasos": [f"Early Return: La Columna {j+1} contiene solo ceros. Matriz singular."]
                }

        # -------------------------------------------------------------
        # EARLY RETURN 3: Filas idénticas o proporcionales (det = 0)
        # -------------------------------------------------------------
        for i in range(n):
            for k in range(i + 1, n):
                # Comprobar proporcionalidad
                ratio = None
                proporcional = True
                for j in range(n):
                    if A[i][j] == 0 and A[k][j] == 0:
                        continue
                    if A[i][j] == 0 or A[k][j] == 0:
                        proporcional = False
                        break
                    r_actual = A[k][j] / A[i][j]
                    if ratio is None:
                        ratio = r_actual
                    elif ratio != r_actual:
                        proporcional = False
                        break
                if proporcional and ratio is not None:
                    return {
                        "invertible": False,
                        "motivo": "TEOREMA: Filas linealmente dependientes.",
                        "detalle": f"La Fila {k+1} es múltiplo exacto de la Fila {i+1} (factor {format_frac(ratio)}).",
                        "pasos": [f"Early Return: Fila {k+1} proporcional a Fila {i+1}. det(A) = 0. Matriz no invertible."]
                    }

        # -------------------------------------------------------------
        # CASO ESPECIAL 2x2: Verificación de determinante ad - bc
        # -------------------------------------------------------------
        if n == 2:
            a, b = A[0][0], A[0][1]
            c, d = A[1][0], A[1][1]
            det = a * d - b * c
            if det == 0:
                return {
                    "invertible": False,
                    "motivo": "TEOREMA 2x2: Si det(A) = ad - bc = 0, entonces A no es invertible.",
                    "detalle": f"det(A) = ({format_frac(a)})({format_frac(d)}) - ({format_frac(b)})({format_frac(c)}) = 0.",
                    "pasos": [f"Early Return: ad - bc = 0. La matriz es singular."]
                }

        # -------------------------------------------------------------
        # CONSTRUCCIÓN DE LA MATRIZ AUMENTADA [A | I_n]
        # -------------------------------------------------------------
        pasos = [
            f"1. Teorema de Gauss-Jordan para A^-1: Se construye la matriz aumentada [A | I_{n}].",
            f"2. Se aplican operaciones elementales por fila hasta transformar [A | I] en [I | A^-1]."
        ]

        # Matriz aumentada de n x 2n
        aumentada = []
        for i in range(n):
            fila_identidad = [Fraction(1) if i == j else Fraction(0) for j in range(n)]
            aumentada.append([parse_frac(A_raw[i][j]) for j in range(n)] + fila_identidad)

        pasos_matrices = [("Paso 1: Matriz aumentada inicial [A | I]:", [[format_frac(c) for c in fila] for fila in aumentada])]

        # Eliminación de Gauss-Jordan en [A | I]
        for col in range(n):
            # Pivoteo parcial
            max_fila = col
            for i in range(col + 1, n):
                if abs(aumentada[i][col]) > abs(aumentada[max_fila][col]):
                    max_fila = i

            # -------------------------------------------------------------
            # EARLY RETURN 4: Si no hay pivote no nulo en la columna
            # -------------------------------------------------------------
            if aumentada[max_fila][col] == 0:
                return {
                    "invertible": False,
                    "motivo": "TEOREMA DE LA MATRIZ INVERTIBLE: A no es equivalente por filas a I_n.",
                    "detalle": f"En la columna {col+1} todas las entradas pivote son cero. La matriz no tiene {n} posiciones pivote.",
                    "pasos": [f"Early Return durante Gauss-Jordan: Columna {col+1} sin pivote. A no tiene inversa."]
                }

            # Intercambio de filas
            if max_fila != col:
                aumentada[col], aumentada[max_fila] = aumentada[max_fila], aumentada[col]
                pasos_matrices.append(
                    (f"Intercambio de filas: Fila {col+1} ↔ Fila {max_fila+1}",
                     [[format_frac(c) for c in fila] for fila in aumentada])
                )

            # Normalizar la fila pivote para que el pivote sea 1
            pivote = aumentada[col][col]
            if pivote != 1:
                for j in range(2 * n):
                    aumentada[col][j] /= pivote
                pasos_matrices.append(
                    (f"Normalizar pivote en posición ({col+1},{col+1}) a 1: Fila {col+1} / ({format_frac(pivote)})",
                     [[format_frac(c) for c in fila] for fila in aumentada])
                )

            # Hacer ceros arriba y abajo del pivote en toda la columna
            for i in range(n):
                if i != col and aumentada[i][col] != 0:
                    factor = aumentada[i][col]
                    for j in range(2 * n):
                        aumentada[i][j] -= factor * aumentada[col][j]
                    pasos_matrices.append(
                        (f"Hacer cero en Fila {i+1}, Columna {col+1}: Fila {i+1} - ({format_frac(factor)}) × Fila {col+1}",
                         [[format_frac(c) for c in fila] for fila in aumentada])
                    )

        # Extraer A^-1 de la mitad derecha de la matriz aumentada [I | A^-1]
        A_inv = []
        for i in range(n):
            A_inv.append([aumentada[i][n + j] for j in range(n)])

        A_inv_str = [[format_frac(c) for c in fila] for fila in A_inv]

        # -------------------------------------------------------------
        # VERIFICACIÓN RIGUROSA EXIGIDA POR LA DIAPOSITIVA: A * A^-1 = I
        # -------------------------------------------------------------
        verif_I = []
        es_identidad = True
        for i in range(n):
            fila_v = []
            for j in range(n):
                suma = sum(A[i][k] * A_inv[k][j] for k in range(n))
                fila_v.append(format_frac(suma))
                esperado = Fraction(1) if i == j else Fraction(0)
                if suma != esperado:
                    es_identidad = False
            verif_I.append(fila_v)

        return {
            "invertible": True,
            "motivo": "A es equivalente por filas a I_n, por tanto A es invertible.",
            "inversa": A_inv_str,
            "verificacion_identidad": verif_I,
            "es_identidad_exacta": es_identidad,
            "pasos_teoricos": pasos,
            "pasos_matrices": pasos_matrices
        }

    # =========================================================================
    # TEOREMA: INVERSA DE LA INVERSA ((A^-1)^-1 = A)
    # =========================================================================
    @classmethod
    def inversa_de_inversa(cls, A_raw):
        # 1. Primera inversión: A -> A^-1
        paso1 = cls.calcular_inversa_gauss_jordan(A_raw)
        if not paso1["invertible"]:
            return paso1

        A_inv = paso1["inversa"]

        # 2. Segunda inversión: (A^-1) -> (A^-1)^-1
        paso2 = cls.calcular_inversa_gauss_jordan(A_inv)

        A_original_reconstruida = paso2["inversa"]

        return {
            "invertible": True,
            "teorema": "Teorema Inciso a: Si A es invertible, entonces (A^-1)^-1 = A.",
            "A_original": [[format_frac(parse_frac(c)) for c in fila] for fila in A_raw],
            "A_inversa": A_inv,
            "A_inversa_de_inversa": A_original_reconstruida,
            "coincide_exactamente": A_original_reconstruida == [[format_frac(parse_frac(c)) for c in fila] for fila in A_raw],
            "pasos": [
                "1. Se calculó la primera inversa A^-1 mediante Gauss-Jordan.",
                "2. Se aplicó nuevamente Gauss-Jordan sobre A^-1 para calcular (A^-1)^-1.",
                "3. Se demostró formalmente que se recupera la matriz A original."
            ]
        }

    # =========================================================================
    # TEOREMA: RESOLVER Ax = b MEDIANTE x = A^-1 * b
    # =========================================================================
    @classmethod
    def resolver_por_inversa(cls, A_raw, b_col):
        fa, ca = cls.validar_matriz(A_raw, "Matriz A")
        fb, cb = cls.validar_matriz(b_col, "Vector b")

        if cb != 1:
            raise ValueError("El término 'b' debe ser un vector columna de 1 columna.")
        if fb != fa:
            raise ValueError(f"Incompatibilidad: b tiene {fb} filas y A tiene {fa} filas.")

        # Calcular A^-1
        inv_res = cls.calcular_inversa_gauss_jordan(A_raw)
        if not inv_res["invertible"]:
            return {
                "resuelto": False,
                "motivo": "No se puede usar el Teorema x = A^-1 * b porque la matriz A no tiene inversa (es singular).",
                "detalle": inv_res["detalle"]
            }

        A_inv = inv_res["inversa"]
        # Multiplicar x = A^-1 * b
        mult_res = cls.multiplicar(A_inv, b_col)

        x_sol = [fila[0] for fila in mult_res["resultado"]]

        return {
            "resuelto": True,
            "teorema": "Teorema: Si A es invertible, la ecuación Ax = b tiene la solución única x = A^-1 * b.",
            "A_inversa": A_inv,
            "x_solucion": x_sol,
            "pasos": [
                "1. Se determinó que A es invertible y se obtuvo su inversa A^-1.",
                "2. Se evaluó el producto x = A^-1 * b:",
                *mult_res["pasos"]
            ]
        }