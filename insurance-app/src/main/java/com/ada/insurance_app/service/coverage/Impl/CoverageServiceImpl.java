package com.ada.insurance_app.service.coverage.Impl;

import com.ada.insurance_app.core.enums.InsuranceType;
import com.ada.insurance_app.core.exception.CoverageNotFoundException;
import com.ada.insurance_app.core.exception.PolicyNotFoundException;
import com.ada.insurance_app.dto.CoverageDto;
import com.ada.insurance_app.entity.Coverage;
import com.ada.insurance_app.entity.Policy;
import com.ada.insurance_app.mapper.CoverageMapper;
import com.ada.insurance_app.repository.ICoverageRepository;
import com.ada.insurance_app.repository.IPolicyRepository;
import com.ada.insurance_app.request.coverage.CreateCoverageRequest;
import com.ada.insurance_app.request.coverage.UpdateCoverageRequest;
import com.ada.insurance_app.service.coverage.ICoverageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CoverageServiceImpl implements ICoverageService {

    private final ICoverageRepository coverageRepository;
    private final IPolicyRepository policyRepository;
    private final CoverageMapper mapper;

    @Override
    @Transactional
    public CoverageDto create(CreateCoverageRequest request) {
        validateRequest(request);

        if (coverageRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Coverage with name " + request.getName() + " already exists");
        }

        Coverage entity = mapper.toEntity(request);
        Coverage saved = coverageRepository.save(entity);

        log.info("Coverage created: {} - {}", saved.getName(), saved.getId());
        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    public CoverageDto update(Long id, UpdateCoverageRequest request) {
        Coverage existing = coverageRepository.findById(id)
                .orElseThrow(() -> new CoverageNotFoundException("Coverage not found with id: " + id));

        if (!existing.getName().equals(request.getName()) &&
                coverageRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Coverage with name " + request.getName() + " already exists");
        }

        mapper.updateEntityFromRequest(existing, request);
        Coverage updated = coverageRepository.save(existing);

        log.info("Coverage updated: {} - {}", updated.getName(), updated.getId());
        return mapper.toDto(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Coverage coverage = coverageRepository.findById(id)
                .orElseThrow(() -> new CoverageNotFoundException("Coverage not found with id: " + id));

        List<Policy> policiesWithCoverage = policyRepository.findByCoveragesContaining(coverage);
        boolean hasActive = policiesWithCoverage.stream()
                .anyMatch(policy -> "ACTIVE".equals(policy.getStatus().name()));

        if (hasActive) {
            throw new IllegalArgumentException("Cannot delete coverage used in active policies");
        }

        coverageRepository.deleteById(id);
        log.info("Coverage deleted: {}", id);
    }

    @Override
    public CoverageDto getById(Long id) {
        Coverage coverage = coverageRepository.findById(id)
                .orElseThrow(() -> new CoverageNotFoundException("Coverage not found with id: " + id));

        return mapper.toDto(coverage);
    }

    @Override
    public List<CoverageDto> getAll() {
        return coverageRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public List<CoverageDto> getCoveragesByPolicy(Long policyId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found with id: " + policyId));

        return policy.getCoverages().stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public List<CoverageDto> getCoveragesByInsuranceType(InsuranceType insuranceType) {
        if (insuranceType == null) {
            throw new IllegalArgumentException("Insurance type cannot be null");
        }

        List<Coverage> coverages = coverageRepository.findByInsuranceType(insuranceType);
        return coverages.stream()
                .map(mapper::toDto)
                .toList();

    }

    @Override
    public List<CoverageDto> getCoveragesByOfferId(Long offerId) {
        if (offerId == null) {
            throw new IllegalArgumentException("Offer ID cannot be null");
        }

        List<Coverage> coverages = coverageRepository.findCoveragesByOfferId(offerId);
        log.info("Found {} coverages for offer ID: {}", coverages.size(), offerId);
        
        return coverages.stream()
                .map(mapper::toDto)
                .toList();
    }

    // PRIVATE VALIDATION
    private void validateRequest(CreateCoverageRequest request) {
        if (request == null)
            throw new IllegalArgumentException("Coverage request cannot be null");

        if (!StringUtils.hasText(request.getName()))
            throw new IllegalArgumentException("Coverage name is required");

        if (!StringUtils.hasText(request.getDescription()))
            throw new IllegalArgumentException("Coverage description is required");

        if (request.getBasePrice() == null || request.getBasePrice().compareTo(BigDecimal.ZERO) <= 0)
            throw new IllegalArgumentException("Coverage price must be positive");
    }
}
