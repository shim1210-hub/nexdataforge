"use client";

import { useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "@/components/design-system";

export function ProductionTabsPreview() {
  const [value, setValue] = useState("overview");

  return (
    <Tabs onValueChange={setValue} value={value}>
      <TabList label="Project sections">
        <Tab value="overview">Overview</Tab>
        <Tab value="activity">Activity</Tab>
        <Tab value="evidence">Evidence</Tab>
        <Tab disabled value="archive">Archive</Tab>
      </TabList>
      <TabPanel value="overview">Project purpose, current state, and next action.</TabPanel>
      <TabPanel value="activity">Recent changes and review history.</TabPanel>
      <TabPanel value="evidence">Sources, owners, and verification results.</TabPanel>
      <TabPanel value="archive">Archived project records.</TabPanel>
    </Tabs>
  );
}
