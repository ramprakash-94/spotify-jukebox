const mode = "prod"


let url = null
if (mode === "dev"){
    url = "http://localhost:4000"
}
else if (mode === "prod"){
    url = "https://jukebox-graphql.herokuapp.com"
}
export default url