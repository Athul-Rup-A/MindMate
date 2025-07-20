const getPastCounPsycho = (appointments) => {
  const now = new Date();

  return Array.from(
    new Map(
      appointments
        .filter((a) =>
          new Date(`${a.SlotDate.split('T')[0]}T${a.SlotEndTime}`) < now &&
          a.CounselorPsychologistId &&
          a.Status === 'completed'
        )
        .map((a) => [
          a.CounselorPsychologistId._id,
          {
            label: `${a.CounselorPsychologistId.FullName} (${a.CounselorPsychologistId.Role})`,
            value: a.CounselorPsychologistId._id,
          },
        ])
    ).values()
  );
};

export default getPastCounPsycho;