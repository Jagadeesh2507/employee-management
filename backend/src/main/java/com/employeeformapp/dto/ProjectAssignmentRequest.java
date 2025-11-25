package com.employeeformapp.dto;

import java.util.Date;

public class ProjectAssignmentRequest {


    public EmployeeDTO employee;
    public ProjectDTO project;
    public String role;
    public Date assignedDate;
    public String remarks;
    public Date endDate;

    public static class EmployeeDTO {
        public int id;
    }

    public static class ProjectDTO {
        public int id;
    }
}



