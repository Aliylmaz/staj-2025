package com.ada.insurance_app.service.coverage;

import com.ada.insurance_app.entity.Coverage;
import java.util.List;
import java.util.UUID;

public interface ICoverageService {
    Coverage create(Coverage coverage);
    Coverage update(Long id, Coverage coverage);
    void delete(Long id);
    Coverage getById(Long id);
    List<Coverage> getAll();
    List<Coverage> getCoveragesByPolicy(Long policyId);
}
