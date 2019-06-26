const mode = "prod"


let url = null
if (mode === "dev"){
    url = "http://localhost:4000"
}
else if (mode === "prod"){
    url = "http://ec2-54-196-77-140.compute-1.amazonaws.com:4000"
}
export default url