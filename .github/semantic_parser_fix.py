from pathlib import Path

service = Path('apps/api/src/geocodificacion/geocodificacion.service.ts')
text = service.read_text()
start = text.index('  private extraerMarcadores(')
end = text.index('  private normalizarEntrecalles(', start)
replacement = r'''  private extraerMarcadores(
    texto: string,
    resultado: DireccionCubanaNormalizada,
  ): void {
    this.extraerSegmentoMarcadores(texto, resultado);
  }

  private extraerComponente(
    componente: string,
    resultado: DireccionCubanaNormalizada,
  ): void {
    this.extraerSegmentoMarcadores(componente, resultado);
  }

  private extraerSegmentoMarcadores(
    texto: string,
    resultado: DireccionCubanaNormalizada,
  ): void {
    const limpio = texto.trim();
    if (!limpio) return;

    const marcador = /\bE\s*\/|#|\b(?:EDIF(?:ICIO)?|BIPLANTA|MODULO)\.?(?=\s|#|$)|\b(?:APARTAMENTO|APTO)\.?(?=\s|#|$)|\b(?:RPTO|REPARTO)\.?(?=\s|$)/gi;
    const coincidencias = [...limpio.matchAll(marcador)];

    if (!coincidencias.length) {
      if (!resultado.entreCalles && /\b.+\s+Y\s+.+\b/i.test(limpio)) {
        resultado.entreCalles = this.normalizarEntrecalles(limpio);
      } else if (!resultado.calle) {
        resultado.calle = this.normalizarCalle(limpio);
      }
      return;
    }

    const primerIndice = coincidencias[0].index ?? 0;
    if (primerIndice > 0 && !resultado.calle) {
      resultado.calle = this.normalizarCalle(limpio.slice(0, primerIndice));
    }

    for (let i = 0; i < coincidencias.length; i += 1) {
      const actual = coincidencias[i];
      const inicioValor = (actual.index ?? 0) + actual[0].length;
      const finValor = coincidencias[i + 1]?.index ?? limpio.length;
      const valor = limpio.slice(inicioValor, finValor).trim();
      if (!valor) continue;

      const token = actual[0].toUpperCase().replace(/\s+/g, '');
      const valorSimple = valor.split(/\s+/)[0].replace(/[.,]+$/, '');

      if (token.startsWith('E/')) {
        resultado.entreCalles ??= this.normalizarEntrecalles(valor);
        continue;
      }
      if (token === '#') {
        resultado.numeroCasa ??= valorSimple;
        continue;
      }
      if (/^(EDIF|EDIFICIO|BIPLANTA|MODULO)/.test(token)) {
        resultado.edificio ??= valorSimple;
        continue;
      }
      if (/^(APARTAMENTO|APTO)/.test(token)) {
        resultado.apartamento ??= valorSimple;
        continue;
      }
      if (token.startsWith('RPTO') || token.startsWith('REPARTO')) {
        const esRptoPuntuado = /^RPTO\.$/i.test(actual[0]);
        if (esRptoPuntuado && resultado.edificio && !resultado.apartamento) {
          resultado.apartamento = valorSimple;
        } else {
          resultado.reparto ??= valor.replace(/[.,]+$/, '').trim();
        }
      }
    }
  }

  private normalizarCalle(texto: string): string | undefined {
    const limpio = texto
      .replace(/^[\s,.-]*CALLE\b\s*/i, '')
      .replace(/[.,]+\s*$/, '')
      .replace(/\s+/g, ' ')
      .trim();
    return limpio || undefined;
  }

'''
text = text[:start] + replacement + text[end:]
old = r'''      /\bE\s*\/|\bRPTO\.?|\bEDIF(?:ICIO)?\.?|\bAPTO\.?|\bAPARTAMENTO\b|#/'''
new = r'''      /\bE\s*\/|\bRPTO\.?|\bREPARTO\b|\bEDIF(?:ICIO)?\.?|\bBIPLANTA\b|\bMODULO\b|\bAPTO\.?|\bAPARTAMENTO\b|#/'''
if old not in text:
    raise SystemExit('No se encontró el marcador de Cuba esperado')
service.write_text(text.replace(old, new, 1))

spec = Path('apps/api/src/geocodificacion/geocodificacion.service.spec.ts')
text = spec.read_text()
text = text.replace("      calle: 'CALLE VICENTE SOMONTE',", "      calle: 'VICENTE SOMONTE',", 1)
text = text.replace("      'CALLE VICENTE SOMONTE, 16, AGRAMONTE Y MARTI, GUAIMARO, CAMAGUEY',", "      'VICENTE SOMONTE, 16, AGRAMONTE Y MARTI, GUAIMARO, CAMAGUEY',", 1)
anchor = "  it('no inventa componentes ausentes al construir consultas', () => {"
tests = r'''  it('interpreta los marcadores semánticos de una dirección cubana compleja', () => {
    const result = normalizar(
      'CALLE 17, MODULO 5, RPTO NUEVO MANZANILLO E/ AVE CAMILO CIENFUEGOS Y 8VA RPTO. B, MANZANILLO, GRANMA',
    );
    expect(result).toMatchObject({
      calle: '17',
      edificio: '5',
      reparto: 'NUEVO MANZANILLO',
      entreCalles: 'AVE CAMILO CIENFUEGOS Y 8VA',
      apartamento: 'B',
      municipio: 'MANZANILLO',
      provincia: 'GRANMA',
    });
  });

  it('trata CALLE como marcador y corta la calle al comenzar REPARTO', () => {
    const result = normalizar(
      'CALLE MASO. REPARTO EL CRISTO # 320 ALTO E/, MANZANILLO, GRANMA',
    );
    expect(result.calle).toBe('MASO');
    expect(result.reparto).toBe('EL CRISTO');
    expect(result.numeroCasa).toBe('320');
  });

  it('separa la calle de REPARTO aunque no exista puntuación', () => {
    const result = normalizar(
      'CALLE SEGUNDA REPARTO PEDRO DIAZ COELLO, MANZANILLO, GRANMA',
    );
    expect(result.calle).toBe('SEGUNDA');
    expect(result.reparto).toBe('PEDRO DIAZ COELLO');
  });

  it('reconoce BIPLANTA y MODULO como marcadores de edificio', () => {
    expect(normalizar('BIPLANTA 3, MANZANILLO, GRANMA').edificio).toBe('3');
    expect(normalizar('MODULO 5, MANZANILLO, GRANMA').edificio).toBe('5');
  });

'''
if anchor not in text:
    raise SystemExit('No se encontró el ancla de tests esperada')
spec.write_text(text.replace(anchor, tests + anchor, 1))
