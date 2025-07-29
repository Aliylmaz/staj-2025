package com.ada.insurance_app.service.coverage.Impl;

import com.ada.insurance_app.core.exception.CoverageNotFoundException;
import com.ada.insurance_app.core.exception.PolicyNotFoundException;
import com.ada.insurance_app.entity.Coverage;
import com.ada.insurance_app.entity.Policy;
import com.ada.insurance_app.repository.ICoverageRepository;
import com.ada.insurance_app.repository.IPolicyRepository;
import com.ada.insurance_app.service.coverage.ICoverageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CoverageServiceImpl implements ICoverageService {
    private final ICoverageRepository coverageRepository;
    private final IPolicyRepository policyRepository;

    @Override
    @Transactional
    public Coverage create(Coverage coverage) {
        // Validate coverage data
        validateCoverage(coverage);
        
        // Check for duplicate coverage name
        if (coverageRepository.existsByName(coverage.getName())) {
            throw new IllegalArgumentException("Coverage with name " + coverage.getName() + " already exists");
        }
        
        Coverage savedCoverage = coverageRepository.save(coverage);
        log.info("Coverage created successfully: {} with id: {}", savedCoverage.getName(), savedCoverage.getId());
        
        return savedCoverage;
    }

    @Override
    @Transactional
    public Coverage update(Long id, Coverage coverage) {
        // Check if coverage exists
        Coverage existing = coverageRepository.findById(id)
                .orElseThrow(() -> new CoverageNotFoundException("Coverage not found with id: " + id));

        // Check for duplicate name (excluding current)
        if (!existing.getName().equals(coverage.getName()) &&
                coverageRepository.existsByName(coverage.getName())) {
            throw new IllegalArgumentException("Coverage with name " + coverage.getName() + " already exists");
        }

        // Update coverage fields
        existing.setName(coverage.getName());
        existing.setDescription(coverage.getDescription());
        existing.setBasePrice(coverage.getBasePrice());
        existing.setActive(coverage.isActive());

        Coverage updated = coverageRepository.save(existing);
        log.info("Coverage updated: {} with id {}", updated.getName(), id);

        return updated;
    }


    @Override
    @Transactional
    public void delete(Long id) {
        // Check if coverage exists
        Coverage coverage = coverageRepository.findById(id)
                .orElseThrow(() -> new CoverageNotFoundException("Coverage not found with id: " + id));
        
        // Check if coverage is used in any active policies
        List<Policy> policiesWithCoverage = policyRepository.findByCoveragesContaining(coverage);
        boolean hasActivePolicies = policiesWithCoverage.stream()
                .anyMatch(policy -> "ACTIVE".equals(policy.getStatus().name()));
        
        if (hasActivePolicies) {
            throw new IllegalArgumentException("Cannot delete coverage that is used in active policies");
        }
        
        coverageRepository.deleteById(id);
        log.info("Coverage deleted successfully with id: {}", id);
    }

    @Override
    public Coverage getById(Long id) {
        Coverage coverage = coverageRepository.findById(id)
                .orElseThrow(() -> new CoverageNotFoundException("Coverage not found with id: " + id));
        
        return coverage;
    }

    @Override
    public List<Coverage> getAll() {
        List<Coverage> coverages = coverageRepository.findAll();
        return coverages;
    }

    @Override
    public List<Coverage> getCoveragesByPolicy(Long policyId) {

        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found with id: " + policyId));
        
        return List.copyOf(policy.getCoverages());
    }

    // Private validation methods
    private void validateCoverage(Coverage coverage) {
        if (coverage == null) {
            throw new IllegalArgumentException("Coverage data cannot be null");
        }
        
        if (!StringUtils.hasText(coverage.getName())) {
            throw new IllegalArgumentException("Coverage name is required");
        }
        
        if (!StringUtils.hasText(coverage.getDescription())) {
            throw new IllegalArgumentException("Coverage description is required");
        }
        
        if (coverage.getBasePrice() == null || coverage.getBasePrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Coverage premium must be greater than zero");
        }
        

    }
}
