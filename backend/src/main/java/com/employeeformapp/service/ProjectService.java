package com.employeeformapp.service;

import com.employeeformapp.dto.ProjectResponse;
import com.employeeformapp.model.Project;
import com.employeeformapp.model.ProjectAssignment;
import com.employeeformapp.repository.ProjectAssignmentRepository;
import com.employeeformapp.repository.ProjectRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class ProjectService {
@Autowired
    private ProjectRepository projectRepository;
@Autowired
private ProjectAssignmentRepository assignmentRepository;

    @PersistenceContext
    private EntityManager entityManager;
    
    

 public List<Project> allProjects(){
     List<Project> projects= projectRepository.findAll();
     for(Project project:projects){
         if(!"Completed".equalsIgnoreCase(project.getStatus())){
            project.setStatus(determineStatus(project.getStartDate(),project.getEndDate()));
         }
     }
     return projects;
 }
 public String determineStatus(Date startDate,Date endDate){
     Date today = new Date();
     if(startDate.after(today)){
         return "NOT_STARTED";
     } else if (endDate.before(today)) {
         return "EXPIRED";
     } else {
         return "IN_PROGRESS";
     }
 }
 public void saveOrUpdate(Project project){
     try{
         project.setStatus(determineStatus(project.getStartDate(),project.getEndDate()));
        projectRepository.save(project);
     }
     catch (Exception e){
         e.printStackTrace();
     }
 }
 public boolean deleteProject(int id){

     try {
         // Step 1: Delete assignments
         assignmentRepository.deleteByProjectId(id);

         // Step 2: Update project status
         Optional<Project> optionalProject = projectRepository.findById(id);
         if (optionalProject.isPresent()) {
             Project project = optionalProject.get();
             project.setStatus("COMPLETED");
             projectRepository.save(project);
         }

         return true;
     } catch (Exception e) {
         e.printStackTrace();
         return false;
     }

 }

    public List<ProjectAssignment> getAssignmentsByProjectId(int projectId) {
        return assignmentRepository.findByProjectId(projectId);
    }




    public List<Project> getFilteredProjects(Map<String, String> filters) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Project> query = cb.createQuery(Project.class);
        Root<Project> root = query.from(Project.class);

        List<Predicate> predicates = new ArrayList<>();

        if (filters != null) {
            if (filters.containsKey("startDateMin")) {
                String startDateMin = filters.get("startDateMin");
                if (startDateMin != null && !startDateMin.trim().isEmpty()) {
                    java.sql.Date date = java.sql.Date.valueOf(LocalDate.parse(startDateMin));
                    predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), date));
                }
            }

            if (filters.containsKey("startDateMax")) {
                String startDateMax = filters.get("startDateMax");
                if (startDateMax != null && !startDateMax.trim().isEmpty()) {
                    java.sql.Date date = java.sql.Date.valueOf(LocalDate.parse(startDateMax));
                    predicates.add(cb.lessThanOrEqualTo(root.get("startDate"), date));
                }
            }

            if (filters.containsKey("endDateMin")) {
                String endDateMin = filters.get("endDateMin");
                if (endDateMin != null && !endDateMin.trim().isEmpty()) {
                    java.sql.Date date = java.sql.Date.valueOf(LocalDate.parse(endDateMin));
                    predicates.add(cb.greaterThanOrEqualTo(root.get("endDate"), date));
                }
            }

            if (filters.containsKey("endDateMax")) {
                String endDateMax = filters.get("endDateMax");
                if (endDateMax != null && !endDateMax.trim().isEmpty()) {
                    java.sql.Date date = java.sql.Date.valueOf(LocalDate.parse(endDateMax));
                    predicates.add(cb.lessThanOrEqualTo(root.get("endDate"), date));
                }
            }

            if (filters.containsKey("clientName")) {
                String clientName = filters.get("clientName");
                if (clientName != null && !clientName.trim().isEmpty()) {
                    predicates.add(cb.equal(cb.lower(root.get("clientName")), clientName.toLowerCase()));
                }
            }

            if (filters.containsKey("technology")) {
                String technology = filters.get("technology");
                if (technology != null && !technology.trim().isEmpty()) {
                    predicates.add(cb.equal(cb.lower(root.get("technology")), technology.toLowerCase()));
                }
            }
        }

        query.where(cb.and(predicates.toArray(new Predicate[0])));
        query.orderBy(cb.desc(root.get("startDate")));

        return entityManager.createQuery(query).getResultList();
    }

    public List<Project> searchByTitle(String title) {
        return projectRepository.findByTitleContainingIgnoreCase(title);
    }
 
    public List<Project> getProjectsByEmployeeId(int employeeId) {
        return assignmentRepository.findProjectsByEmployeeId(employeeId);
    }

}
