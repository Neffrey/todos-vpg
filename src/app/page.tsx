//LIBS
import { unstable_noStore as noStore } from "next/cache";

// COMPONENTS
import CreateTaskDialog, { LoginBtn } from "~/components/create-task-dialog";
import ProtectedContent from "~/components/protectedContent";
import TaskTableController from "~/app/_components/tasks-table/table-controller";

const Home = async () => {
  noStore();

  return (
    <div
      // HERO ROW
      className="flex w-full flex-wrap items-center justify-around gap-12 bg-gradient-to-br from-background to-background/50 py-12 md:justify-center"
    >
      <ProtectedContent
        authedRoles={["ADMIN", "USER", "RESTRICTED"]}
        fallback={<LoginBtn />}
      >
        <div className="flex w-full flex-col items-center gap-6">
          <CreateTaskDialog />
          <TaskTableController />
        </div>
      </ProtectedContent>
    </div>
  );
};

export default Home;
