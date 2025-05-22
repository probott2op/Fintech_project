package com.example.paynest.util;

import com.example.paynest.DTO.TransactionDTO;
import com.example.paynest.entity.Account;
import com.example.paynest.entity.TransactionType;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Component;

import java.io.OutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;





import java.awt.Color;
import java.io.OutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;


@Component
public class PdfHelper {

    public void generateAccountStatement(Account account, List<TransactionDTO> transactions,
                                         OutputStream outputStream) throws DocumentException {
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, outputStream);

        document.open();

        // Add title and header
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

        // Title
        Paragraph title = new Paragraph("PayNest Account Statement", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(Chunk.NEWLINE);

        // Account information
        document.add(new Paragraph("Account Number: " + account.getAccountNumber(), headerFont));
        document.add(new Paragraph("Account Holder: " + account.getUser().getFullName(), normalFont));
        document.add(new Paragraph("Statement Date: " +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")), normalFont));
        document.add(new Paragraph("Current Balance: $" + account.getBalance(), headerFont));
        document.add(Chunk.NEWLINE);

        // Create table for transactions
        PdfPTable table = new PdfPTable(6); // 6 columns
        table.setWidthPercentage(100);

        // Set column widths
        float[] columnWidths = {2f, 3f, 2f, 2.5f, 4f, 2f};
        table.setWidths(columnWidths);

        // Add table headers
        addTableHeader(table);

        // Add transaction data
        addTransactionData(table, transactions, account.getAccountNumber());

        document.add(table);

        // Add footer
        document.add(Chunk.NEWLINE);
        Paragraph footer = new Paragraph("Thank you for banking with PayNest", normalFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
    }

    private void addTableHeader(PdfPTable table) {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);

        PdfPCell cell;

        String[] headers = {"Date", "Transaction ID", "Type", "Amount", "Description", "Status"};

        for (String header : headers) {
            cell = new PdfPCell(new Phrase(header, headerFont));
            cell.setBackgroundColor(Color.DARK_GRAY);
            cell.setPadding(5);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }
    }

    private void addTransactionData(PdfPTable table, List<TransactionDTO> transactions, String accountNumber) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
        Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9);

        for (TransactionDTO transaction : transactions) {
            // Date
            PdfPCell cell = new PdfPCell(new Phrase(
                    transaction.getTimestamp().format(formatter), dataFont));
            cell.setPadding(4);
            table.addCell(cell);

            // Transaction ID
            cell = new PdfPCell(new Phrase(transaction.getId().toString(), dataFont));
            cell.setPadding(4);
            table.addCell(cell);

            // Type
            cell = new PdfPCell(new Phrase(transaction.getType().toString(), dataFont));
            cell.setPadding(4);
            table.addCell(cell);

            // Amount
            String amountText = "$" + transaction.getAmount().toString();
            cell = new PdfPCell(new Phrase(amountText, dataFont));
            cell.setPadding(4);
            table.addCell(cell);

            // Description
            String description = getTransactionDescription(transaction, accountNumber);
            cell = new PdfPCell(new Phrase(description, dataFont));
            cell.setPadding(4);
            table.addCell(cell);

            // Status
            String status = transaction.isApproved() ? "Approved" : "Pending";
            cell = new PdfPCell(new Phrase(status, dataFont));
            cell.setPadding(4);
            table.addCell(cell);
        }
    }

    private String getTransactionDescription(TransactionDTO transaction, String accountNumber) {
        if ("DEPOSIT".equals(transaction.getType())) {
            return "Deposit to account";
        } else if ("WITHDRAW".equals(transaction.getType())) {
            return "Withdrawal from account";
        } else if ("TRANSFER".equals(transaction.getType())) {
            if (transaction.getSenderAccountNumber().equals(accountNumber)) {
                return "Transfer to: " + transaction.getReceiverAccountNumber();
            } else {
                return "Transfer from: " + transaction.getSenderAccountNumber();
            }
        }
        return "";
    }
        }


