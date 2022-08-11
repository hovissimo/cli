const capitalize = s => s && s[0].toUpperCase() + s.slice(1)

function getType (key, property) {
  if (key === 'key') {
    return 'hidden'
  }
  let { type } = property
  if (type === 'integer' || type === 'number') {
    return 'number'
  }
  else if (type === 'boolean') {
    return 'checkbox'
  }
  else if (type === 'string') {
    if (property.format) {
      if (property.format === 'date-time') {
        return 'datetime-local'
      }
      else if (property.format === 'uri') {
        return 'url'
      }
      else {
        return property.format
      }
    }
    return 'text'
  }
  return type
}

function inputTemplate (key, type, property, data, required = []) {
  let input = '<input type="' + type + '" id="' + key + '" name="' + key + '" '
  if (property.minimum) {
    input = input + 'min="' + property.minimum + '"'
  }
  if (property.minLength) {
    input = input + 'minlength="' + property.minLength + '"'
  }
  if (property.maximum) {
    input = input + 'max="' + property.maximum + '"'
  }
  if (property.maxLength) {
    input = input + 'maxlength="' + property.maxLength + '"'
  }
  if (property.pattern) {
    input = input + 'pattern="' + property.pattern + '"'
  }
  if (required.includes(key)) {
    input = input + 'required'
  }
  if (type === 'checkbox' && data[key] === true) {
    input = input + 'checked'
  }
  input = input + `value="\${${data}?.${key}}" />`
  return input
}

function selectTemplate (key, property, data, required = []) {
  let input = '<select id="' + key + '" name="' + key + '"'
  if (required.includes(key)) {
    input = input + 'required'
  }
  input = input + '>'
  property.enum.forEach(item => input = input + `<option value="${item}" ${item === data[key]?.value ? 'selected' : ''}>${item}</option>`)
  input = input + '</select>'
  return input
}

function input (key, schema, data) {
  const property = schema.properties[key]
  const type = getType(key, property)
  let elem = ''
  if (property.enum) {
    elem = selectTemplate(key, property, data, schema.required)
  }
  else if (type === 'object') {
    elem = elem + `<h2>${capitalize(key)}</h2>`
    elem = elem + Object.keys(schema.properties[key].properties).map(innerKey =>
      input(innerKey, schema.properties[key], data)
    ).join('\n')
  }
  else {
    elem = inputTemplate(key, type, property, data, schema.required)
  }
  if (type !== 'hidden' && type !== 'object') {
    elem = `<label>${capitalize(key)} ${elem}</label>`
  }
  return elem
}

function schemaToForm ({ action, schema, update = false, data }) {
  return `<h2>${capitalize(schema?.id)}</h2>
<div style="display:\${display}">
  <p>Found some problems!</p>
  <ul>\${problems?.map(li).join('') || ''}</ul>
</div>
<form
  style="display: flex; flex-direction: column; gap: 1rem;"
  action="/${action}${update ? `/\${${data}.key}` : ''}"
  method="POST">
  ${Object.keys(schema.properties).map(key =>
    input(key, schema, data)
  ).join('\n  ')}
  <button style="max-width: 6rem;">Save</button>
</form>`
}

module.exports = {
  schemaToForm
}