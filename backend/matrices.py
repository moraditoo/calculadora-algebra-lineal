# matrices.py
from fractions import Fraction
from gauss import format_frac, parse_frac

class OperacionesMatrices:
    @staticmethod
    def validar_matriz(mat, nombre="Matriz"):
        # Validar estructura y no vacio
        if not mat or not isinstance(mat, list):
            raise ValueError(f"{nombre} no tiene un formato valido.")
        filas = len(mat)
        if filas == 0:
            raise ValueError(f"{nombre} no puede estar vacia.")
        cols = len(mat[0])
        # Validar regularidad dimensional
        for i, f in enumerate(mat):
            if len(f) != cols:
                raise ValueError(f"{nombre} tiene dimensiones irregulares en la fila {i + 1}.")
        return filas, cols

    @classmethod
    def sumar(cls, A, B):
        fa, ca = cls.validar_matriz(A, "Matriz A")
        fb, cb = cls.validar_matriz(B, "Matriz B")
        # Validar dimensiones identicas
        if fa != fb or ca != cb:
            raise ValueError(f"Dimensiones incompatibles para suma: {fa}x{ca} vs {fb}x{cb}.")

        pasos = [
            f"Operacion: Suma de matrices de orden {fa}x{ca}.",
            "Teorema / Regla: C[i, j] = A[i, j] + B[i, j] para cada elemento."
        ]
        res = []
        for i in range(fa):
            fila = []
            for j in range(ca):
                va = parse_frac(A[i][j])
                vb = parse_frac(B[i][j])
                s = va + vb
                fila.append(format_frac(s))
                pasos.append(f"• C[{i+1},{j+1}] = ({format_frac(va)}) + ({format_frac(vb)}) = {format_frac(s)}")
            res.append(fila)
        return {"resultado": res, "pasos": pasos}

    @classmethod
    def restar(cls, A, B):
        fa, ca = cls.validar_matriz(A, "Matriz A")
        fb, cb = cls.validar_matriz(B, "Matriz B")
        if fa != fb or ca != cb:
            raise ValueError(f"Dimensiones incompatibles para resta: {fa}x{ca} vs {fb}x{cb}.")

        pasos = [
            f"Operacion: Resta de matrices de orden {fa}x{ca}.",
            "Teorema / Regla: C[i, j] = A[i, j] - B[i, j] para cada elemento."
        ]
        res = []
        for i in range(fa):
            fila = []
            for j in range(ca):
                va = parse_frac(A[i][j])
                vb = parse_frac(B[i][j])
                r = va - vb
                fila.append(format_frac(r))
                pasos.append(f"• C[{i+1},{j+1}] = ({format_frac(va)}) - ({format_frac(vb)}) = {format_frac(r)}")
            res.append(fila)
        return {"resultado": res, "pasos": pasos}

    @classmethod
    def escalar(cls, c, A):
        fa, ca = cls.validar_matriz(A, "Matriz A")
        c_frac = parse_frac(c)
        pasos = [
            f"Operacion: Multiplicacion por escalar c = {format_frac(c_frac)} en orden {fa}x{ca}.",
            "Teorema / Regla: C[i, j] = c * A[i, j] distribuyendo sobre cada entrada."
        ]
        res = []
        for i in range(fa):
            fila = []
            for j in range(ca):
                va = parse_frac(A[i][j])
                prod = c_frac * va
                fila.append(format_frac(prod))
                pasos.append(f"• C[{i+1},{j+1}] = ({format_frac(c_frac)}) * ({format_frac(va)}) = {format_frac(prod)}")
            res.append(fila)
        return {"resultado": res, "pasos": pasos}

    @classmethod
    def multiplicar(cls, A, B):
        fa, ca = cls.validar_matriz(A, "Matriz A")
        fb, cb = cls.validar_matriz(B, "Matriz B")
        # Validar compatibilidad producto matricial
        if ca != fb:
            raise ValueError(f"Incompatibilidad de producto: Columnas de A ({ca}) deben ser iguales a Filas de B ({fb}).")

        pasos = [
            f"Operacion: Multiplicacion matricial ({fa}x{ca}) * ({fb}x{cb}) -> ({fa}x{cb}).",
            "Teorema / Regla Fila por Columna: C[i, j] = Suma(A[i, k] * B[k, j]) para k = 1 hasta " + str(ca)
        ]
        res = []
        for i in range(fa):
            fila = []
            for j in range(cb):
                detalles_k = []
                suma = Fraction(0)
                for k in range(ca):
                    va = parse_frac(A[i][k])
                    vb = parse_frac(B[k][j])
                    prod = va * vb
                    suma += prod
                    detalles_k.append(f"({format_frac(va)} * {format_frac(vb)})")
                fila.append(format_frac(suma))
                pasos.append(f"• C[{i+1},{j+1}] = {' + '.join(detalles_k)} = {format_frac(suma)}")
            res.append(fila)
        return {"resultado": res, "pasos": pasos}

    @classmethod
    def transponer(cls, A):
        fa, ca = cls.validar_matriz(A, "Matriz A")
        pasos = [
            f"Operacion: Transpuesta de orden ({fa}x{ca}) -> ({ca}x{fa}).",
            "Teorema / Definicion: Se intercambian indices A^T[j, i] = A[i, j]."
        ]
        res = []
        for j in range(ca):
            fila = []
            for i in range(fa):
                v = parse_frac(A[i][j])
                fila.append(format_frac(v))
                pasos.append(f"• A^T[{j+1},{i+1}] = A[{i+1},{j+1}] = {format_frac(v)}")
            res.append(fila)
        return {"resultado": res, "pasos": pasos}

    @classmethod
    def calcular_inversa_gauss_jordan(cls, A_raw):
        fa, ca = cls.validar_matriz(A_raw, "Matriz A")
        
        # Early Return 1: Matriz debe ser estrictamente cuadrada
        if fa != ca:
            return {
                "invertible": False,
                "motivo": "TEOREMA: La matriz debe ser estrictamente cuadrada (n x n) para tener inversa.",
                "detalle": f"La matriz ingresada es de orden {fa}x{ca}. No existe matriz C tal que AC = CA = I.",
                "pasos": [f"Early Return: Matriz no cuadrada ({fa}x{ca})."]
            }

        n = fa
        A = [[parse_frac(val) for val in fila] for fila in A_raw]

        # Early Return 2: Filas o Columnas compuestas por ceros
        for i in range(n):
            if all(A[i][j] == 0 for j in range(n)):
                return {
                    "invertible": False,
                    "motivo": "TEOREMA DE LA MATRIZ INVERTIBLE: Fila nula detectada.",
                    "detalle": f"La fila {i+1} contiene solo ceros. det(A) = 0 y no puede tener {n} pivotes.",
                    "pasos": [f"Early Return: Fila {i+1} nula. Matriz singular."]
                }
        for j in range(n):
            if all(A[i][j] == 0 for i in range(n)):
                return {
                    "invertible": False,
                    "motivo": "TEOREMA DE LA MATRIZ INVERTIBLE: Columna nula detectada.",
                    "detalle": f"La columna {j+1} contiene solo ceros. Las columnas son linealmente dependientes.",
                    "pasos": [f"Early Return: Columna {j+1} nula. Matriz singular."]
                }

        # Early Return 3: Filas proporcionales o identicas
        for i in range(n):
            for k in range(i + 1, n):
                ratio = None
                proporcional = True
                for j in range(n):
                    if A[i][j] == 0 and A[k][j] == 0:
                        continue
                    if A[i][j] == 0 or A[k][j] == 0:
                        proporcional = False
                        break
                    r_act = A[k][j] / A[i][j]
                    if ratio is None:
                        ratio = r_act
                    elif ratio != r_act:
                        proporcional = False
                        break
                if proporcional and ratio is not None:
                    return {
                        "invertible": False,
                        "motivo": "TEOREMA: Dependencia lineal entre filas (Filas proporcionales).",
                        "detalle": f"La Fila {k+1} es multiplo escalar de la Fila {i+1} (factor {format_frac(ratio)}).",
                        "pasos": [f"Early Return: Filas dependientes {i+1} y {k+1}. det(A) = 0."]
                    }

        # Early Return 4: Determinante en orden 2x2
        if n == 2:
            a, b = A[0][0], A[0][1]
            c, d = A[1][0], A[1][1]
            det = a * d - b * c
            if det == 0:
                return {
                    "invertible": False,
                    "motivo": "TEOREMA 2x2: Si ad - bc = 0, la matriz no es invertible.",
                    "detalle": f"det(A) = ({format_frac(a)})({format_frac(d)}) - ({format_frac(b)})({format_frac(c)}) = 0.",
                    "pasos": ["Early Return: Determinante nulo."]
                }

        # Construccion de la matriz aumentada [A | I_n]
        aumentada = []
        for i in range(n):
            identidad = [Fraction(1) if i == j else Fraction(0) for j in range(n)]
            aumentada.append([parse_frac(A_raw[i][j]) for j in range(n)] + identidad)

        pasos_matrices = [("Paso 1: Construccion de la Matriz Aumentada inicial [A | I]:", 
                           [[format_frac(c) for c in fila] for fila in aumentada])]
        detalles_explicativos = [
            "Fundamento de Gauss-Jordan para A^-1: Se yuxtapone la matriz identidad I a la derecha de A.",
            "Cualquier operacion elemental aplicada a las filas de A para llevarla a I transformara simultaneamente I en A^-1."
        ]

        # Reduccion completa a la forma escalonada reducida
        for col in range(n):
            # Pivoteo parcial
            max_fila = col
            for i in range(col + 1, n):
                if abs(aumentada[i][col]) > abs(aumentada[max_fila][col]):
                    max_fila = i

            # Early Return durante el escalonamiento si se pierde un pivote
            if aumentada[max_fila][col] == 0:
                return {
                    "invertible": False,
                    "motivo": "TEOREMA DE LA MATRIZ INVERTIBLE: A no es equivalente por filas a I_n.",
                    "detalle": f"En la columna {col+1} todas las entradas pivote son nulas. Rango menor a {n}.",
                    "pasos": [f"Early Return: Ausencia de pivote no nulo en columna {col+1}."]
                }

            # Intercambio de filas
            if max_fila != col:
                aumentada[col], aumentada[max_fila] = aumentada[max_fila], aumentada[col]
                desc = f"Intercambio: Fila {col+1} <-> Fila {max_fila+1} (Mayor valor absoluto como pivote)"
                pasos_matrices.append((desc, [[format_frac(c) for c in fila] for fila in aumentada]))
                detalles_explicativos.append(f"• Intercambio Fila {col+1} con Fila {max_fila+1} para estabilidad numerica.")

            # Normalizar fila pivote
            pivote = aumentada[col][col]
            if pivote != 1:
                detalles_norm = []
                for j in range(2 * n):
                    antes = aumentada[col][j]
                    aumentada[col][j] /= pivote
                    detalles_norm.append(f"({format_frac(antes)}) / ({format_frac(pivote)}) = {format_frac(aumentada[col][j])}")
                
                desc = f"Normalizacion: Fila {col+1} / ({format_frac(pivote)}) para hacer el pivote igual a 1"
                pasos_matrices.append((desc, [[format_frac(c) for c in fila] for fila in aumentada]))
                detalles_explicativos.append(f"• Division Fila {col+1} entre pivote {format_frac(pivote)}: normaliza posicion ({col+1},{col+1}) a 1.")

            # Anular arriba y abajo del pivote
            for i in range(n):
                if i != col and aumentada[i][col] != 0:
                    factor = aumentada[i][col]
                    for j in range(2 * n):
                        aumentada[i][j] -= factor * aumentada[col][j]
                    
                    desc = f"Eliminacion: Fila {i+1} - ({format_frac(factor)}) * Fila {col+1} (Haciendo cero posicion ({i+1},{col+1}))"
                    pasos_matrices.append((desc, [[format_frac(c) for c in fila] for fila in aumentada]))
                    detalles_explicativos.append(f"• Fila {i+1} <- Fila {i+1} - ({format_frac(factor)})*Fila {col+1}: genera cero en columna {col+1}.")

        # Extraer A^-1 del bloque derecho
        A_inv = [[aumentada[i][n + j] for j in range(n)] for i in range(n)]
        A_inv_str = [[format_frac(c) for c in fila] for fila in A_inv]

        # Verificacion formal termino a termino A * A^-1 = I_n
        verif_I = []
        detalles_verificacion = []
        for i in range(n):
            fila_v = []
            for j in range(n):
                sumandos = []
                suma = Fraction(0)
                for k in range(n):
                    va = A[i][k]
                    vb = A_inv[k][j]
                    prod = va * vb
                    suma += prod
                    sumandos.append(f"({format_frac(va)})*({format_frac(vb)})")
                fila_v.append(format_frac(suma))
                esperado = "1 (Diagonal)" if i == j else "0 (Fuera de diagonal)"
                detalles_verificacion.append(
                    f"Posicion ({i+1},{j+1}) [Fila {i+1} de A . Col {j+1} de A^-1]: "
                    f"{' + '.join(sumandos)} = {format_frac(suma)} [{esperado}]"
                )
            verif_I.append(fila_v)

        return {
            "invertible": True,
            "motivo": "Matriz equivalente por filas a I_n. Proceso de Gauss-Jordan completado exitosamente.",
            "inversa": A_inv_str,
            "verificacion_identidad": verif_I,
            "detalles_explicativos": detalles_explicativos,
            "detalles_verificacion": detalles_verificacion,
            "pasos_matrices": pasos_matrices
        }

    @classmethod
    def inversa_de_inversa(cls, A_raw):
        # Primer paso: Invertir A
        paso1 = cls.calcular_inversa_gauss_jordan(A_raw)
        if not paso1["invertible"]:
            return paso1

        A_inv = paso1["inversa"]
        # Segundo paso: Invertir la matriz inversa resultante
        paso2 = cls.calcular_inversa_gauss_jordan(A_inv)

        A_orig_eval = [[format_frac(parse_frac(c)) for c in fila] for fila in A_raw]
        A_inv_inv = paso2["inversa"]

        return {
            "invertible": True,
            "teorema": "Teorema de Inversion: Si A es invertible, entonces (A^-1)^-1 = A.",
            "A_original": A_orig_eval,
            "A_inversa": A_inv,
            "A_inversa_de_inversa": A_inv_inv,
            "coincide": A_orig_eval == A_inv_inv,
            "pasos": [
                "1. Se aplico Gauss-Jordan sobre A obteniendo A^-1.",
                "2. Se aplico Gauss-Jordan sobre A^-1 obteniendo (A^-1)^-1.",
                "3. Se comprobo que (A^-1)^-1 coincide exactamente elemento por elemento con la matriz original A."
            ]
        }

    @classmethod
    def resolver_por_inversa(cls, A_raw, b_col):
        fa, ca = cls.validar_matriz(A_raw, "Matriz A")
        fb, cb = cls.validar_matriz(b_col, "Vector b")

        # Validar b como vector columna
        if cb != 1:
            raise ValueError("El termino b debe ser un vector columna de 1 columna.")
        if fb != fa:
            raise ValueError(f"Incompatibilidad: b tiene {fb} filas y A tiene {fa} filas.")

        # Obtener A^-1
        inv_res = cls.calcular_inversa_gauss_jordan(A_raw)
        if not inv_res["invertible"]:
            return {
                "resuelto": False,
                "motivo": "No se puede resolver x = A^-1 * b porque A no es invertible (es singular).",
                "detalle": inv_res["detalle"]
            }

        A_inv = inv_res["inversa"]
        # Multiplicar x = A^-1 * b
        mult_res = cls.multiplicar(A_inv, b_col)
        x_sol = [fila[0] for fila in mult_res["resultado"]]

        return {
            "resuelto": True,
            "teorema": "Teorema: Si A es invertible, el sistema Ax = b tiene solucion unica dada por x = A^-1 * b.",
            "A_inversa": A_inv,
            "x_solucion": x_sol,
            "pasos_multiplicacion": mult_res["pasos"]
        }