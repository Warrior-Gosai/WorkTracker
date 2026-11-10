package com.devworktracker.export;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

public class ExcelGenerationPrototypeTest {

    @Test
    public void testDailyWorkLogGeneration() throws Exception {
        try (InputStream is = getClass().getResourceAsStream("/excel-templates/Daily_Work_Log.xlsx")) {
            assertNotNull(is, "Daily_Work_Log.xlsx template must exist in classpath");
            try (XSSFWorkbook workbook = new XSSFWorkbook(is)) {
                XSSFSheet sheet = workbook.getSheetAt(0);
                assertEquals("Daily Work Log", sheet.getSheetName());

                // Capture data styles from row 1
                Row sampleRow = sheet.getRow(1);
                assertNotNull(sampleRow);
                int numCols = 22;
                CellStyle[] dataStyles = new CellStyle[numCols];
                for (int c = 0; c < numCols; c++) {
                    Cell cell = sampleRow.getCell(c);
                    dataStyles[c] = (cell != null) ? cell.getCellStyle() : workbook.createCellStyle();
                }

                // Clear all rows from row 1 to lastRowNum
                int lastRow = sheet.getLastRowNum();
                for (int r = lastRow; r >= 1; r--) {
                    Row row = sheet.getRow(r);
                    if (row != null) {
                        sheet.removeRow(row);
                    }
                }

                // Write 2 test rows
                for (int i = 0; i < 2; i++) {
                    int rowNum = i + 1;
                    Row row = sheet.createRow(rowNum);
                    row.setHeightInPoints(20.0f);

                    for (int c = 0; c < numCols; c++) {
                        Cell cell = row.createCell(c);
                        cell.setCellStyle(dataStyles[c]);
                    }

                    // Col 0: Work ID
                    row.getCell(0).setCellValue("WL-00000" + (i + 1));
                    // Col 1: Date
                    LocalDate date = LocalDate.of(2026, 11, 10 + i);
                    row.getCell(1).setCellValue(date);
                    // Col 2: Day formula
                    row.getCell(2).setCellFormula(String.format("IF(B%d=\"\",\"\",TEXT(B%d,\"dddd\"))", rowNum + 1, rowNum + 1));
                    // Col 3: Project
                    row.getCell(3).setCellValue("WorkTracker");
                    // Col 4: Module
                    row.getCell(4).setCellValue("Reports & Exports");
                    // Col 5: Task
                    row.getCell(5).setCellValue("Build Excel Export");
                    // Col 6: Work Type
                    row.getCell(6).setCellValue("Development");
                    // Col 7: Description
                    row.getCell(7).setCellValue("Implemented POI exporter");
                    // Col 10: Start Time
                    LocalTime st = LocalTime.of(9, 30);
                    row.getCell(10).setCellValue((st.toSecondOfDay()) / 86400.0);
                    // Col 11: End Time
                    LocalTime et = LocalTime.of(17, 30);
                    row.getCell(11).setCellValue((et.toSecondOfDay()) / 86400.0);
                    // Col 12: Total Hours
                    row.getCell(12).setCellValue(8.00);
                    // Col 13: Status
                    row.getCell(13).setCellValue("COMPLETED");
                }

                // Write to byte array and read back
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                workbook.write(baos);
                byte[] bytes = baos.toByteArray();
                assertTrue(bytes.length > 0);

                try (XSSFWorkbook readBack = new XSSFWorkbook(new java.io.ByteArrayInputStream(bytes))) {
                    XSSFSheet readSheet = readBack.getSheetAt(0);
                    assertEquals(2, readSheet.getLastRowNum());
                    assertEquals("WL-000001", readSheet.getRow(1).getCell(0).getStringCellValue());
                    assertEquals("WorkTracker", readSheet.getRow(1).getCell(3).getStringCellValue());
                    assertEquals(8.00, readSheet.getRow(1).getCell(12).getNumericCellValue(), 0.001);
                }
            }
        }
    }
}
