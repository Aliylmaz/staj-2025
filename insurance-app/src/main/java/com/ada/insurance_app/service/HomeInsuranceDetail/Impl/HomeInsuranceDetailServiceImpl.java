package com.ada.insurance_app.service.HomeInsuranceDetail.Impl;

import com.ada.insurance_app.core.exception.ResourceNotFoundException;
import com.ada.insurance_app.dto.HomeInsuranceDetailDto;
import com.ada.insurance_app.entity.HomeInsuranceDetail;
import com.ada.insurance_app.mapper.HomeInsuranceDetailMapper;
import com.ada.insurance_app.repository.HomeInsuranceDetailRepository;
import com.ada.insurance_app.request.home.CreateHomeInsuranceDetailRequest;
import com.ada.insurance_app.request.home.UpdateHomeInsuranceDetailRequest;
import com.ada.insurance_app.service.HomeInsuranceDetail.IHomeInsuranceDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HomeInsuranceDetailServiceImpl implements IHomeInsuranceDetailService {

    private final HomeInsuranceDetailRepository repository;
    private final HomeInsuranceDetailMapper mapper;

    @Override
    public HomeInsuranceDetailDto create(CreateHomeInsuranceDetailRequest request) {

        HomeInsuranceDetail detail = mapper.toEntity(request);
        HomeInsuranceDetail savedDetail = repository.save(detail);
        return mapper.toDto(savedDetail);


    }

    @Override
    public HomeInsuranceDetailDto update(UUID id, UpdateHomeInsuranceDetailRequest request) {
        HomeInsuranceDetail existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HomeInsuranceDetail not found"));

        mapper.updateEntityFromRequest(existing, request);
        HomeInsuranceDetail updated = repository.save(existing);
        return mapper.toDto(updated);
    }

    @Override
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("HomeInsuranceDetail not found");
        }
        repository.deleteById(id);
    }

    @Override
    public HomeInsuranceDetailDto getById(UUID id) {
        HomeInsuranceDetail detail = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HomeInsuranceDetail not found"));
        return mapper.toDto(detail);
    }

    @Override
    public List<HomeInsuranceDetailDto> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }
}
