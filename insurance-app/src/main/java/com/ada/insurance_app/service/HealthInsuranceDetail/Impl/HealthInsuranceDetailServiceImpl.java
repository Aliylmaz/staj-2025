package com.ada.insurance_app.service.HealthInsuranceDetail.Impl;

import com.ada.insurance_app.entity.HealthInsuranceDetail;
import com.ada.insurance_app.repository.IHealthInsuranceDetailRepository;
import com.ada.insurance_app.service.HealthInsuranceDetail.IHealthInsuranceDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;



import com.ada.insurance_app.core.exception.ResourceNotFoundException;
import com.ada.insurance_app.dto.HealthInsuranceDetailDto;
import com.ada.insurance_app.entity.Customer;
import com.ada.insurance_app.entity.Offer;

import com.ada.insurance_app.mapper.HealthInsuranceDetailMapper;

import com.ada.insurance_app.request.health.CreateHealthInsuranceDetailRequest;
import com.ada.insurance_app.request.health.UpdateHealthInsuranceDetailRequest;


@Service
@RequiredArgsConstructor
public class HealthInsuranceDetailServiceImpl implements IHealthInsuranceDetailService {

    private final IHealthInsuranceDetailRepository repository;
    private final HealthInsuranceDetailMapper mapper;

    @Override
    public HealthInsuranceDetailDto create(CreateHealthInsuranceDetailRequest request) {
        HealthInsuranceDetail detail = mapper.toEntity(request);
        // offerId ile ilişkilendir
        Offer offer = new Offer();
        offer.setId(request.getOfferId());
        detail.setOffer(offer);
        // (Opsiyonel) customerId ile ilişkiyi de koru
        if (request.getCustomerId() != null) {
            Customer customer = new Customer();
            customer.setId(request.getCustomerId());
            detail.setCustomer(customer);
        }
        HealthInsuranceDetail saved = repository.save(detail);
        return mapper.toDto(saved);
    }

    @Override
    public HealthInsuranceDetailDto update(UUID id, UpdateHealthInsuranceDetailRequest request) {
        HealthInsuranceDetail existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HealthInsuranceDetail not found"));
        mapper.updateEntityFromRequest(existing, request);
        // offerId güncellemesi (isteğe bağlı, genelde değişmez)
        if (request.getOfferId() != null) {
            Offer offer = new Offer();
            offer.setId(request.getOfferId());
            existing.setOffer(offer);
        }
        if (request.getCustomerId() != null) {
            Customer customer = new Customer();
            customer.setId(request.getCustomerId());
            existing.setCustomer(customer);
        }
        HealthInsuranceDetail updated = repository.save(existing);
        return mapper.toDto(updated);
    }

    @Override
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("HealthInsuranceDetail not found");
        }
        repository.deleteById(id);
    }

    @Override
    public HealthInsuranceDetailDto getById(UUID id) {
        HealthInsuranceDetail detail = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HealthInsuranceDetail not found"));
        return mapper.toDto(detail);
    }

    @Override
    public List<HealthInsuranceDetailDto> getAll() {
        return repository.findAll().stream()
                .map(mapper::toDto)
                .toList();
    }
}
