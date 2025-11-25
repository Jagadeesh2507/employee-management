package com.employeeformapp.repository;

import com.employeeformapp.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Repository
public interface ProjectRepository extends JpaRepository<Project,Integer> {
    @Query("SELECT p FROM Project p WHERE p.endDate BETWEEN :today AND :threeDaysLater")
    List<Project> findProjectsWithUpcomingDeadlines(@Param("today") Date today, @Param("threeDaysLater") Date threeDaysLater);
   // List<Project> findByFilters(Map<String, String> filters);
   List<Project> findByTitleContainingIgnoreCase(String title);
}
