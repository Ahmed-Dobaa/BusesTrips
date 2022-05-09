
module.exports = {

    OK: (reply, response) => {
        return reply.response({ Value: response.value, message: response.message }).code(200);
    },
    NotAllowed: (reply, errorDescription) => {
      return reply.response({ message: errorDescription}).code(406);
    },
    InternalServerError: (reply, errorDescription) => {
      return reply.response({ message: `Internal Server Error, ${errorDescription}`}).code(500);
    }

}
