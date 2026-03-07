package com.luvina.pos.provider.dto.base;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
public class BaseResponse {

    @Builder.Default
    private String status = "Success";

    private Object data;

}
