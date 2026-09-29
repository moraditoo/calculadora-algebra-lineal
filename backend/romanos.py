# romanos.py

class OperacionesRomanos:
    ROMANOS_DIGITOS = {
        1: "I", 2: "II", 3: "III", 4: "IV",
        5: "V", 6: "VI", 7: "VII", 8: "VIII", 9: "IX"
    }
    ARABIGOS_DIGITOS = {v: k for k, v in ROMANOS_DIGITOS.items()}

    # Tabla extendida para representar resultados de operaciones (hasta 9 x 9 = 81)
    VALORES_ROMANOS = [
        (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
        (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")
    ]

    @classmethod
    def entero_a_romano(cls, n):
        if n <= 0:
            raise ValueError("El sistema de numeración romana no contempla el cero ni números negativos.")
        res = ""
        resto = n
        for val, rom in cls.VALORES_ROMANOS:
            while resto >= val:
                res += rom
                resto -= val
        return res

    @classmethod
    def validar_digito_romano(cls, entrada):
        s = str(entrada).strip().upper()
        # Si el usuario ingresó el arábigo
        if s.isdigit():
            val = int(s)
            if 1 <= val <= 9:
                return val, cls.ROMANOS_DIGITOS[val]
            raise ValueError(f"Solo se permiten números del 1 al 9. Valor recibido: {val}.")
        
        # Si ingresó el romano
        if s in cls.ARABIGOS_DIGITOS:
            return cls.ARABIGOS_DIGITOS[s], s
        
        raise ValueError(f"'{s}' no es un dígito romano válido del 1 al 9 (I, II, III, IV, V, VI, VII, VIII, IX).")

    @classmethod
    def suma(cls, a_str, b_str):
        val_a, rom_a = cls.validar_digito_romano(a_str)
        val_b, rom_b = cls.validar_digito_romano(b_str)

        total = val_a + val_b
        rom_total = cls.entero_a_romano(total)

        pasos = [
            f"1. Identificación de operandos: {rom_a} ({val_a}) y {rom_b} ({val_b}).",
            f"2. Suma aritmética equivalente: {val_a} + {val_b} = {total}.",
            f"3. Conversión del valor resultante al sistema romano:",
            f"   {total} = {rom_total}."
        ]

        return {
            "romano_a": rom_a,
            "romano_b": rom_b,
            "resultado_romano": rom_total,
            "resultado_arabigo": total,
            "pasos": pasos
        }

    @classmethod
    def resta(cls, a_str, b_str):
        val_a, rom_a = cls.validar_digito_romano(a_str)
        val_b, rom_b = cls.validar_digito_romano(b_str)

        if val_a <= val_b:
            raise ValueError(
                f"Resta inválida en números romanos ({rom_a} - {rom_b}): "
                f"El minuendo ({val_a}) debe ser estrictamente mayor que el sustraendo ({val_b}) "
                f"porque los romanos no utilizaban el cero ni números negativos."
            )

        total = val_a - val_b
        rom_total = cls.entero_a_romano(total)

        pasos = [
            f"1. Identificación de operandos: {rom_a} ({val_a}) y {rom_b} ({val_b}).",
            f"2. Validación: {val_a} > {val_b} (resultado positivo no nulo).",
            f"3. Resta aritmética: {val_a} - {val_b} = {total}.",
            f"4. Conversión del resultado: {total} = {rom_total}."
        ]

        return {
            "romano_a": rom_a,
            "romano_b": rom_b,
            "resultado_romano": rom_total,
            "resultado_arabigo": total,
            "pasos": pasos
        }

    @classmethod
    def multiplicacion(cls, a_str, b_str):
        val_a, rom_a = cls.validar_digito_romano(a_str)
        val_b, rom_b = cls.validar_digito_romano(b_str)

        total = val_a * val_b
        rom_total = cls.entero_a_romano(total)

        # Definición formal de multiplicación como suma repetida
        terminos_arabigos = [str(val_a)] * val_b
        terminos_romanos = [rom_a] * val_b

        pasos = [
            f"1. Identificación de operandos: {rom_a} ({val_a}) multiplicado por {rom_b} ({val_b}).",
            f"2. Aplicación de la definición de multiplicación como suma repetida:",
            f"   {rom_a} × {rom_b} = " + " + ".join(terminos_romanos),
            f"3. Equivalencia aritmética de las sumas sucesivas ({val_b} veces {val_a}):",
            f"   " + " + ".join(terminos_arabigos) + f" = {total}.",
            f"4. Conversión del producto a numeral romano:",
            f"   {total} = {rom_total}."
        ]

        return {
            "romano_a": rom_a,
            "romano_b": rom_b,
            "resultado_romano": rom_total,
            "resultado_arabigo": total,
            "pasos": pasos
        }

    @classmethod
    def convertir_simple(cls, entrada):
        s = str(entrada).strip().upper()
        if not s:
            raise ValueError("Por favor ingrese un valor.")

        if s.isdigit():
            val = int(s)
            if 1 <= val <= 9:
                return {
                    "tipo": "arabigo_a_romano",
                    "original": val,
                    "resultado": cls.ROMANOS_DIGITOS[val],
                    "explicacion": f"El número arábigo {val} equivale al dígito romano '{cls.ROMANOS_DIGITOS[val]}'."
                }
            raise ValueError(f"Solo se permiten dígitos del 1 al 9. Valor ingresado: {val}.")
        
        if s in cls.ARABIGOS_DIGITOS:
            val = cls.ARABIGOS_DIGITOS[s]
            return {
                "tipo": "romano_a_arabigo",
                "original": s,
                "resultado": val,
                "explicacion": f"El símbolo romano '{s}' equivale al valor numérico arábigo {val}."
            }

        raise ValueError(f"'{s}' no es un dígito válido del 1 al 9.")