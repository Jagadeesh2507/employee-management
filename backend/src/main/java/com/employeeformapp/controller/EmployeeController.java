package com.employeeformapp.controller;

import com.employeeformapp.dto.EmployeeRequestDTO;
import com.employeeformapp.dto.EmployeeResponseDTO;
import com.employeeformapp.model.Employee;
import com.employeeformapp.service.EmployeeService;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import jakarta.websocket.server.PathParam;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.tomcat.util.http.fileupload.ByteArrayOutputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Indexed;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import org.springframework.http.HttpHeaders;

import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/secured/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;
   //EmployeeResponseDTO response = new EmployeeResponseDTO();

    @PostMapping("/save.ws")
    public ResponseEntity<EmployeeResponseDTO> saveEmployee(@RequestBody EmployeeRequestDTO request) {
        EmployeeResponseDTO response = new EmployeeResponseDTO();
        try {
            System.out.println("Datas coming");
            employeeService.saveEmployee(request);
            response.status = "Success";
            response.message = (request.id != 0) ? "Employee Updated" : "Employee Saved";
            response.data = request;
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.status = "Failed";
            response.message = e.getMessage();
            response.data = request;
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<EmployeeResponseDTO> deleteEmployee(@PathVariable int id) {
        EmployeeResponseDTO response = new EmployeeResponseDTO();
        try {
            employeeService.deleteEmployee(id);
            response.status = "Success";
            response.message = "Employee deleted successfully!";
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.status = "Failed";
            response.message = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }
    @GetMapping("/all")
    public List<Employee> getAllEmployees(){
        List<Employee> data= employeeService.getAllEmployeesSortedByLatest();
        System.out.print("Hello this the data :");
        data.forEach(System.out::println);
        return data;
    }
    @GetMapping("/search/{name}")
    public List<Employee>search(@PathVariable("name") String name){
    List<Employee> employees=employeeService.searchByName(name);
    return employees;
    }
    @GetMapping("/download/excel")
    public ResponseEntity<byte[]> downloadEmployeesExcel() {
        try {
            List<Employee> employees = employeeService.getAllEmployeesSortedByLatest();
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Employees Data");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.SKY_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            // Header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"S.NO", "Name", "Gender", "Date of Joining", "Designation",
                    "Email", "Phone Number", "Has Bank Account", "Bank Name", "Account Number", "Skill"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int rowNum = 1;
            for (Employee employee : employees) {
                Row dataRow = sheet.createRow(rowNum);
                dataRow.createCell(0).setCellValue(rowNum);
                dataRow.createCell(1).setCellValue(employee.getName());
                dataRow.createCell(2).setCellValue(employee.getGender());
                dataRow.createCell(3).setCellValue(employee.getDateofJoining().toString()); // Format if needed
                dataRow.createCell(4).setCellValue(employee.getDesignation());
                dataRow.createCell(5).setCellValue(employee.getEmail());
                dataRow.createCell(6).setCellValue(employee.getPhoneNumber());
                String hasBankAccount = "true".equalsIgnoreCase(employee.getHasbankaccount()) ? "Yes" : "No";
                dataRow.createCell(7).setCellValue(hasBankAccount);

                if (employee.getAccount() != null) {
                    dataRow.createCell(8).setCellValue(employee.getAccount().getBankName());
                    dataRow.createCell(9).setCellValue(employee.getAccount().getAccountNumber());
                } else {
                    dataRow.createCell(8).setCellValue("");
                    dataRow.createCell(9).setCellValue("");
                }

                dataRow.createCell(10).setCellValue(employee.getSkill());
                rowNum++;
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Write to byte array
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            workbook.write(bos);
            workbook.close();
            byte[] excelBytes = bos.toByteArray();

            // Prepare response
            HttpHeaders headersResponse = new HttpHeaders();
            headersResponse.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headersResponse.setContentDispositionFormData("attachment", "employees_data_" + System.currentTimeMillis() + ".xlsx");

            return new ResponseEntity<>(excelBytes, headersResponse, HttpStatus.OK);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Failed to generate Excel file: " + e.getMessage()).getBytes());
        }
    }

    @GetMapping("/download/pdf")
    public ResponseEntity<byte[]> downloadPdf() {
        try {
            List<Employee> employees = employeeService.getAllEmployeesSortedByLatest();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            // Title
            document.add(new Paragraph("Employee List PDF Report", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.BLACK)));
            document.add(new Paragraph("Generated on: " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()), FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.GRAY)));
            document.add(new Paragraph("\n\n"));

            // Table setup
            PdfPTable table = new PdfPTable(10);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);
            float[] columnWidths = {0.5f, 1.5f, 1f, 1.2f, 1.2f, 1.8f, 1.2f, 0.8f, 1.5f, 1.5f};
            table.setWidths(columnWidths);

            // Header row
            String[] headers = {"S.NO", "Name", "Gender", "Date of Joining", "Designation",
                    "Email", "Phone Number", "Has Bank Account", "Bank Name", "Account Number"};
            com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BaseColor.WHITE);
            BaseColor headerBgColor = new BaseColor(66, 139, 202);

            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setBackgroundColor(headerBgColor);
                cell.setPadding(5);
                table.addCell(cell);
            }

            table.setHeaderRows(1);

            // Data rows
            com.itextpdf.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 8, BaseColor.BLACK);
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            int sNo = 1;

            for (Employee employee : employees) {
                table.addCell(new Phrase(String.valueOf(sNo++), dataFont));
                table.addCell(new Phrase(employee.getName(), dataFont));
                table.addCell(new Phrase(employee.getGender(), dataFont));
                table.addCell(new Phrase(employee.getDateofJoining(), dataFont));
                table.addCell(new Phrase(employee.getDesignation(), dataFont));
                table.addCell(new Phrase(employee.getEmail(), dataFont));
                table.addCell(new Phrase(String.valueOf(employee.getPhoneNumber()), dataFont));
                String hasBankAccount = (employee.getHasbankaccount() != null && employee.getHasbankaccount().equalsIgnoreCase("true")) ? "Yes" : "No";
                table.addCell(new Phrase(hasBankAccount, dataFont));

                if (employee.getAccount() != null) {
                    table.addCell(new Phrase(employee.getAccount().getBankName(), dataFont));
                    table.addCell(new Phrase(employee.getAccount().getAccountNumber(), dataFont));
                } else {
                    table.addCell(new Phrase("", dataFont));
                    table.addCell(new Phrase("", dataFont));
                }
            }

            document.add(table);
            document.close();

            byte[] pdfBytes = baos.toByteArray();

            HttpHeaders header = new HttpHeaders();
            header.setContentType(MediaType.APPLICATION_PDF);
            String filename = "employees_data_" + new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date()) + ".pdf";
            header.setContentDispositionFormData("attachment", filename);

            return ResponseEntity.ok()
                    .headers(header)
                    .body(pdfBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(("Error generating PDF: " + e.getMessage()).getBytes());
        }
    }


    @GetMapping("/search-by-skill/{skill}")
    public ResponseEntity<List<Employee>> searchBySkill(@PathVariable("skill") String skill) {
        List<Employee> employees = employeeService.searchBySkill(skill);
        return ResponseEntity.ok(employees);
    }
    
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable int id) {
        Employee emp = employeeService.getEmployeeById(id);

        if (emp == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Employee not found");
        }

        return ResponseEntity.ok(emp);
    }




}

