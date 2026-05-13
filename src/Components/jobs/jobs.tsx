import React, { useEffect, useState } from "react";
import { Text, View, ScrollView } from "react-native";

type Job = {
  id: number;
  title: string;
};

export default function Jobinterview() {
  const [companies, setCompanies] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(
          "https://remotive.com/api/remote-jobs"
        );

        const data = await res.json();

        console.log("API DATA:", data);

        setCompanies(data.jobs);
      } catch (error) {
        console.log("ERROR:", error);
      }
    };

    fetchJobs();
  }, []);

  return (
    <ScrollView>
      <View>
        {companies.map((job) => (
          <Text key={job.id}>{job.title}</Text>
        ))}
      </View>
    </ScrollView>
  );
}