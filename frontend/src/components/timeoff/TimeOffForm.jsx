// src/components/timeoff/TimeOffForm.jsx
import React from "react";
import Select from "@components/common/Select";
import DatePicker from "@components/common/DatePicker";
import Textarea from "@components/common/Textarea";
import Button from "@components/common/Button";
import { TIMEOFF_TYPES } from "@utils/constants";

const TimeOffForm = ({ formData, onChange, onSubmit, errors = {}, loading }) => {
  const timeOffOptions = Object.values(TIMEOFF_TYPES).map((type) => ({
    value: type,
    label: type,
  }));

  // Generic field handler to support both select/datepickers and textareas
  const handleFieldChange = (name, valueOrEvent) => {
    let value =
      valueOrEvent?.target?.value !== undefined
        ? valueOrEvent.target.value
        : valueOrEvent;
    onChange({ target: { name, value } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Time Off Type */}
      <Select
        label="Time Off Type"
        name="timeOffType"
        value={formData.timeOffType || ""}
        onChange={(e) => handleFieldChange("timeOffType", e)}
        options={timeOffOptions}
        error={errors.timeOffType}
        required
      />

      {/* Start & End Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DatePicker
          label="Start Date"
          name="startDate"
          value={formData.startDate || ""}
          onChange={(value) => handleFieldChange("startDate", value)}
          error={errors.startDate}
          min={new Date().toISOString().split("T")[0]}
          required
        />
        <DatePicker
          label="End Date"
          name="endDate"
          value={formData.endDate || ""}
          onChange={(value) => handleFieldChange("endDate", value)}
          error={errors.endDate}
          min={formData.startDate || new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      {/* Reason */}
      <Textarea
        label="Reason"
        name="reason"
        value={formData.reason || ""}
        onChange={(e) => handleFieldChange("reason", e)}
        placeholder="Enter reason for leave..."
        rows={4}
        error={errors.reason}
      />

      {/* Action Buttons */}
      <div className="flex gap-4 pt-2">
        <Button type="submit" loading={loading}>
          Submit Request
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default TimeOffForm;
