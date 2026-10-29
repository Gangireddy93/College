/**
 * College Branding & Institution Settings Store
 * Enables ANY college or university to use this portal with custom names,
 * codes, accreditations, and examination titles.
 */

const DEFAULT_SETTINGS = {
  collegeName: "College of Engineering & Technology",
  collegeCode: "CET",
  affiliation: "Autonomous Institution • Approved by AICTE • Accredited with 'A+' Grade",
  examTitle: "Semester Examination Seating Admit Card",
};

export function getCollegeSettings() {
  try {
    const saved = localStorage.getItem("college_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.error("Error reading college settings:", err);
  }
  return DEFAULT_SETTINGS;
}

export function saveCollegeSettings(settings) {
  try {
    const updated = { ...DEFAULT_SETTINGS, ...settings };
    localStorage.setItem("college_settings", JSON.stringify(updated));
    window.dispatchEvent(new Event("college_settings_changed"));
    return updated;
  } catch (err) {
    console.error("Error saving college settings:", err);
    return DEFAULT_SETTINGS;
  }
}
