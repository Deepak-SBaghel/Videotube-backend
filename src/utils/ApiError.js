class ApiError extends Error {
    constructor(
        statusCode,
        message ="Something went wrong",
        error=[],// write all error in this
        stack = ""

    ){
        super(message,error)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        // because we are sending an error so the sucess is false
        this.errors = error;

        if(stack){
            this.stack = stack
        } else {
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export { ApiError }