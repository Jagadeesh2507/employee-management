package com.employeeformapp.dto;

import java.util.Date;

public class AssignedEmployeeDTO {
    private String employeeName;
    private String projectTitle;
    private Date projectEndDate;
    private int employeeId;
    private int projectAssignmentId;

    public AssignedEmployeeDTO(int projectAssignmentId,int employeeId,String employeeName, String projectTitle, Date projectEndDate) {
        this.employeeName = employeeName;
        this.projectTitle = projectTitle;
        this.projectEndDate = projectEndDate;
        this.employeeId=employeeId;
        this.projectAssignmentId=projectAssignmentId;
    }

    // Getters and setters
    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public void setProjectTitle(String projectTitle) {
        this.projectTitle = projectTitle;
    }

    public Date getProjectEndDate() {
        return projectEndDate;
    }

    public void setProjectEndDate(Date projectEndDate) {
        this.projectEndDate = projectEndDate;
    }

    public int getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(int employeeId) {
        this.employeeId = employeeId;
    }

    public int getProjectAssignmentId() {
        return projectAssignmentId;
    }

    public void setProjectAssignmentId(int projectAssignmentId) {
        this.projectAssignmentId = projectAssignmentId;
    }
}
