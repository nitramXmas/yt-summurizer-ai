import { useForm } from "react-hook-form"

import './App.css'
import ResultText from "./components/ResultText"

function App() {

    const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const onSubmit = (data) => console.log(data)

  return (
    <div className="app">
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form_container">
        <input className="input" placeholder="Wich product to you need to review from YT ?" {...register("searchInput", { required: true })} />
        {/* errors will return when field validation fails  */}
        <input className="button_submit" type="submit" />
      </div>
      {errors.searchInput && <span>This field is required</span>}
    </form>
    <ResultText/>
    </div>
  )
}

export default App
