import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import PrizeAssignmentsPage from "@/pages/PrizeAssignments";

const Prizing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/20 p-4 md:p-6 relative z-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Admin
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Gift className="h-8 w-8 text-primary" /> Prize Assignments
              </h1>
              <p className="text-muted-foreground mt-1">Assign winners after the run. Prize policy now lives in the Admin dashboard.</p>
            </div>
          </div>
        </motion.div>
        <PrizeAssignmentsPage embedded />
      </div>
    </div>
  );
};

export default Prizing;
