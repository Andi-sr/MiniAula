function numeroSeguro(valor) {
  if (valor === null || valor === undefined || valor === '') return null

  const numero = Number(valor)

  return Number.isFinite(numero) ? numero : null
}

export function adaptarEstadisticasInstructor(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return null
  }

  const lecciones = Array.isArray(datos.lecciones)
    ? [...datos.lecciones]
      .map((leccion) => ({
        leccionId: leccion.leccionId ?? leccion.id ?? null,
        orden: numeroSeguro(leccion.orden),
        titulo: String(leccion.titulo || 'Lección sin título'),
        llegaron: numeroSeguro(leccion.llegaron),
        completaron: numeroSeguro(leccion.completaron)
      }))
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    : []

  let mayorDisminucion = null

  for (let indice = 1; indice < lecciones.length; indice += 1) {
    const anterior = lecciones[indice - 1]
    const actual = lecciones[indice]

    if (anterior.llegaron === null || actual.llegaron === null) continue

    const diferencia = anterior.llegaron - actual.llegaron

    if (diferencia <= 0) continue

    if (!mayorDisminucion || diferencia > mayorDisminucion.diferencia) {
      mayorDisminucion = {
        desde: anterior,
        hasta: actual,
        diferencia
      }
    }
  }

  const resultadosBrutos = datos.resultados || {}

  return {
    cursoId: datos.cursoId ?? null,
    inscritos: numeroSeguro(datos.inscritos),
    progresoPromedio: numeroSeguro(datos.progresoPromedio),
    notaPromedio: numeroSeguro(datos.notaPromedio),
    completaronCurso: numeroSeguro(datos.completaronCurso),
    lecciones,
    mayorDisminucion,
    resultados: {
      disponible: Boolean(resultadosBrutos.disponible),
      evaluados: numeroSeguro(resultadosBrutos.evaluados),
      notaPromedio: numeroSeguro(resultadosBrutos.notaPromedio),
      aprobados: numeroSeguro(resultadosBrutos.aprobados),
      agotaronIntentos: numeroSeguro(resultadosBrutos.agotaronIntentos)
    }
  }
}
