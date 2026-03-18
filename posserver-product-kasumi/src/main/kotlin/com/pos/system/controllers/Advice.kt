package com.pos.system.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import com.pos.system.exception.*
import com.pos.system.model.others.Exception
import jakarta.validation.UnexpectedTypeException
import org.springframework.http.HttpStatus
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.context.request.WebRequest
import org.springframework.web.servlet.NoHandlerFoundException

@RestControllerAdvice
class Advice {
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(BadRequest::class)
    fun badRequest(ex: BadRequest? = null): Exception {
        val exception = Exception()
        exception.status = ex?.status ?: 400
        exception.error = "Invalid input"
        exception.message = ex?.messages?.let {
            if (it is String) it else ObjectMapper().writeValueAsString(it)
        } ?: "Invalid input"
        return exception
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun badRequest2(): Exception {
        return badRequest()
    }

   @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(UnexpectedTypeException::class) // MethodArgumentNotValidException
    fun badRequest3(): Exception {
        return badRequest()
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(UnAuthorized::class)
    fun unAuthorized(): Exception {
        val exception = Exception()
        exception.status = 401
        exception.error = "Unauthorized"
        exception.message = "Incorrect authentication info"
        return exception
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ExceptionHandler(Forbidden::class)
    fun forbidden(): Exception {
        val exception = Exception()
       exception.status = 403
        exception.error = "Forbidden"
        exception.message = "Not allowed"
        return exception
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(NoHandlerFoundException::class)
    fun notFound01(): Exception {
        return shareNotFound()
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(NotFound::class)
    fun notFound02(ex: NotFound, request: WebRequest): Exception {
        return shareNotFound(ex.messages)
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    @ExceptionHandler(Conflict::class)
    fun conflict(): Exception {
        val exception = Exception()
       exception.status = 409
        exception.error = "Conflict"
        exception.message = "Already exist email"
        return exception
    }

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(java.lang.Exception::class)
    fun serverError(): Exception {
        val exception = Exception()
        exception.status = 500
        exception.error = "Internal server error"
        exception.message = "Internal server error"
        return exception
    }

    private fun shareNotFound(message: Any? = null): Exception {
        val exception = Exception()
        exception.status = 404
        exception.error = "Not found"
        exception.message = message?.let {
            if (it is String) it else ObjectMapper().writeValueAsString(it)
        } ?: "Not found"
        return exception
    }
}
