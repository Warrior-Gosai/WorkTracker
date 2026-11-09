package com.devworktracker.taskitem.dao;

import com.devworktracker.taskitem.dto.CodeChangeHistoryDto;
import com.devworktracker.taskitem.dto.DbChangeHistoryDto;
import com.devworktracker.taskitem.dto.WorkLogHistoryDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;
import java.util.*;
import java.util.stream.Collectors;

@Repository
public class TaskItemHistoryDaoImpl implements TaskItemHistoryDao {

    private final JdbcTemplate jdbcTemplate;

    public TaskItemHistoryDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<WorkLogHistoryDto> getHistoryForTaskItem(Long taskItemId) {
        String workLogSql = """
            SELECT work_log_id, work_log_code, work_date, environment, work_type,
                   status, task_requirement, work_description, start_time, end_time, created_at
            FROM work_log
            WHERE task_item_id = ?
            ORDER BY work_date DESC, work_log_id DESC
        """;

        List<WorkLogHistoryDto> workLogs = jdbcTemplate.query(workLogSql, (rs, rowNum) -> {
            Date workDateSql = rs.getDate("work_date");
            Time startTimeSql = rs.getTime("start_time");
            Time endTimeSql = rs.getTime("end_time");
            Timestamp createdAtSql = rs.getTimestamp("created_at");

            return new WorkLogHistoryDto(
                    rs.getLong("work_log_id"),
                    rs.getString("work_log_code"),
                    workDateSql != null ? workDateSql.toLocalDate() : null,
                    rs.getString("environment"),
                    rs.getString("work_type"),
                    rs.getString("status"),
                    rs.getString("task_requirement"),
                    rs.getString("work_description"),
                    startTimeSql != null ? startTimeSql.toLocalTime() : null,
                    endTimeSql != null ? endTimeSql.toLocalTime() : null,
                    createdAtSql != null ? createdAtSql.toInstant() : null
            );
        }, taskItemId);

        if (workLogs.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> workLogIds = workLogs.stream()
                .map(WorkLogHistoryDto::getWorkLogId)
                .toList();

        String inSql = String.join(",", Collections.nCopies(workLogIds.size(), "?"));

        // Query code changes
        String codeChangeSql = String.format("""
            SELECT code_change_id, code_change_code, work_log_id, change_status,
                   svn_commit_id, change_datetime, environment, remarks
            FROM code_change
            WHERE work_log_id IN (%s)
            ORDER BY change_datetime DESC, code_change_id DESC
        """, inSql);

        Map<Long, List<CodeChangeHistoryDto>> codeChangesByWorkLog = new HashMap<>();
        jdbcTemplate.query(codeChangeSql, ps -> {
            for (int i = 0; i < workLogIds.size(); i++) {
                ps.setLong(i + 1, workLogIds.get(i));
            }
        }, rs -> {
            long workLogId = rs.getLong("work_log_id");
            Timestamp changeDatetimeSql = rs.getTimestamp("change_datetime");

            CodeChangeHistoryDto dto = new CodeChangeHistoryDto(
                    rs.getLong("code_change_id"),
                    rs.getString("code_change_code"),
                    rs.getString("change_status"),
                    rs.getString("svn_commit_id"),
                    changeDatetimeSql != null ? changeDatetimeSql.toInstant() : null,
                    rs.getString("environment"),
                    rs.getString("remarks")
            );

            codeChangesByWorkLog.computeIfAbsent(workLogId, k -> new ArrayList<>()).add(dto);
        });

        // Query DB changes
        String dbChangeSql = String.format("""
            SELECT db_change_id, db_change_code, work_log_id, environment, database_name,
                   object_type, object_name, what_changed, created_at
            FROM db_change
            WHERE work_log_id IN (%s)
            ORDER BY created_at DESC, db_change_id DESC
        """, inSql);

        Map<Long, List<DbChangeHistoryDto>> dbChangesByWorkLog = new HashMap<>();
        jdbcTemplate.query(dbChangeSql, ps -> {
            for (int i = 0; i < workLogIds.size(); i++) {
                ps.setLong(i + 1, workLogIds.get(i));
            }
        }, rs -> {
            long workLogId = rs.getLong("work_log_id");
            Timestamp createdAtSql = rs.getTimestamp("created_at");

            DbChangeHistoryDto dto = new DbChangeHistoryDto(
                    rs.getLong("db_change_id"),
                    rs.getString("db_change_code"),
                    rs.getString("environment"),
                    rs.getString("database_name"),
                    rs.getString("object_type"),
                    rs.getString("object_name"),
                    rs.getString("what_changed"),
                    createdAtSql != null ? createdAtSql.toInstant() : null
            );

            dbChangesByWorkLog.computeIfAbsent(workLogId, k -> new ArrayList<>()).add(dto);
        });

        // Assemble into workLogs
        for (WorkLogHistoryDto wl : workLogs) {
            wl.setCodeChanges(codeChangesByWorkLog.getOrDefault(wl.getWorkLogId(), Collections.emptyList()));
            wl.setDbChanges(dbChangesByWorkLog.getOrDefault(wl.getWorkLogId(), Collections.emptyList()));
        }

        return workLogs;
    }
}

