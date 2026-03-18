package com.luvina.pos.provider.exception;

import lombok.Getter;

@Getter
public class NotFoundException extends RuntimeException {
	private final Object[] args;
	private static final long serialVersionUID = -2634379978579601027L;

	public NotFoundException(String message) {
		this(message, new Object[]{});
	}

	public NotFoundException(String message, Object... args) {
		super(message);
		this.args = args;
	}
}
