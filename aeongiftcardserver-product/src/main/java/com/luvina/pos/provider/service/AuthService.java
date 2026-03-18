package com.luvina.pos.provider.service;

import com.luvina.pos.provider.config.security.JwtProvider;
import com.luvina.pos.provider.domain.master.primarykey.InstoreId;
import com.luvina.pos.provider.dto.app.AppUserDto;
import com.luvina.pos.provider.dto.app.PosTokenResDto;
import com.luvina.pos.provider.exception.AuthException;
import com.luvina.pos.provider.exception.NotFoundException;
import com.luvina.pos.provider.mapper.IntoreMapper;
import com.luvina.pos.provider.repository.master.InstoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.luvina.pos.provider.constant.MessageConstant.MSG001E;

@Service
@RequiredArgsConstructor
@Transactional(value = "masterTransactionManager", rollbackFor = Exception.class)
public class AuthService {

    private final InstoreRepository instoreRepository;

    private final IntoreMapper intoreMapper;

    private final JwtProvider jwtProvider;

    public PosTokenResDto login(AppUserDto appUserDto){
        InstoreId id = intoreMapper.toInstoreId(appUserDto);
        if(!instoreRepository.existsById(id)){
            throw new NotFoundException(MSG001E);
        }
        String posToken = jwtProvider.createPosTokenForApp(appUserDto);
        PosTokenResDto posTokenResDto = new PosTokenResDto();
        posTokenResDto.setPosToken(posToken);
        return posTokenResDto;
    }

}
