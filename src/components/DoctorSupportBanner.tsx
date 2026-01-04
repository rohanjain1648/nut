import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const DoctorSupportBanner = () => {
    return (
        <div className="w-full bg-orange-50/50 dark:bg-orange-950/10 border-y border-orange-100 dark:border-orange-900/20 py-12">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                                Need professional help?
                            </h3>
                            <p className="text-muted-foreground">
                                If you think you have a severe issue, please contact a doctor immediately.
                            </p>
                        </div>
                    </div>
                    <Button
                        asChild
                        variant="default"
                        size="lg"
                        className="bg-orange-600 hover:bg-orange-700 text-white min-w-[200px]"
                    >
                        <Link to="/doctors">
                            Contact Doctor
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};
