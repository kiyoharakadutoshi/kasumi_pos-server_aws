package com.luvina.pos.provider.dto.base;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@Builder
@AllArgsConstructor
public class PageResponse<T> {
    private Long totalCount;

    private Integer currentPage;

    private Integer totalPage;

    private List<T> items;

}
