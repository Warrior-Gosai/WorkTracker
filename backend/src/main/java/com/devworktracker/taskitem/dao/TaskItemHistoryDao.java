package com.devworktracker.taskitem.dao;

import com.devworktracker.taskitem.dto.WorkLogHistoryDto;

import java.util.List;

public interface TaskItemHistoryDao {

    List<WorkLogHistoryDto> getHistoryForTaskItem(Long taskItemId);
}

