const mode = "dev"


let url = null
if (mode === "dev"){
    url = "http://localhost:4000"
}
else if (mode === "prod"){
    url = ""
}
export default url
