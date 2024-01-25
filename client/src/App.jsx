import { useForm } from "react-hook-form"
import  axios  from "axios"

import './App.css'
import ResultText from "./components/ResultText"
import { useState } from "react"

const apiUrl = "http://localhost:5019/api"

function App() {

  const [resultText, setResultText] = useState()

    const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const onSubmit = (data) => {
    
    axios.post(`${apiUrl}/search`, {
      search: data.searchInput,
      language : data.language
    })
    .then(response => {
      setResultText(response.data.summarizedText)
    })
    .catch(err => console.error(err))
  } 

  return (
    <div className="app">
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form_container">
        <input className="input" placeholder="Wich product to you need to review from YT ?" {...register("searchInput", { required: true })} />
        <input className="radio" type="radio" value="french"{...register("language")} />
        Francais
        <input className="radio" type="radio" value="english"{...register("language")} />
        English
        {/* errors will return when field validation fails  */}
        <input className="button_submit" type="submit" />
      </div>
      {errors.searchInput && <span>This field is required</span>}
    </form>
    {resultText ? <ResultText text={resultText}/> : <ResultText />}
    </div>
  )
}

export default App
