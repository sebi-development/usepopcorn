import { createContext, useContext, useState } from "react"

const FormContext = createContext()

function Form({ onSubmit, children, externalError }) {
  const [values, setValues] = useState({})
  const [error, setError] = useState('')

  function handleChange(e) {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  return (
    <FormContext.Provider value={{ values, handleChange, error: externalError || error, setError }}>
      <form onSubmit={onSubmit} >
        {children}
      </form>
    </FormContext.Provider>
  )
}

function Input({ name, type = 'text', label }) {
  const { values, handleChange } = useContext(FormContext)

  return (
    <div className="form-group">
      <label> {label} </label>
      <input name={name} type={type} value={values[name] ?? ''} onChange={handleChange} />
    </div>
  )
}

function Button({ children }) {
  return <button type="submit" className="btn-auth">{children}</button>
}

function Error() {
  const { error } = useContext(FormContext)
  if (!error) return null

  return (
    <div>
      <p> {error} </p>
    </div>
  )
}

Form.Input = Input
Form.Button = Button
Form.Error = Error

export default Form