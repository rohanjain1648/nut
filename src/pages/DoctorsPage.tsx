import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, MapPin, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export const DoctorsPage = () => {
    const doctors = [
        {
            id: 1,
            name: "Mansi Poddar",
            title: "Trauma-Informed Psychotherapist",
            address: "9th floor, Park Center Building, 24 Park St, Park Street area, Kolkata",
            phone: "098300 15724",
            calendlyLink: "https://calendly.com/mansi-poddar" // Placeholder
        },
        {
            id: 2,
            name: "M-Power – The Centre (Kolkata)",
            title: "Mental Health Center",
            address: "Ideal Plaza, Unit N210A-211, 2nd Floor, North Block, 11/1 Sarat Bose Rd, Kolkata",
            phone: "090735 55522",
            calendlyLink: "https://calendly.com/m-power-kolkata" // Placeholder
        },
        {
            id: 3,
            name: "Dr. Sonalika Mondal",
            title: "Consultant Psychiatrist",
            address: "Health Care, Bata More, Bagbazaar (near Shyam Bazaar, Fariapukur), Kolkata",
            phone: "096350 97144",
            calendlyLink: "https://calendly.com/dr-sonalika-mondal" // Placeholder
        },
        {
            id: 4,
            name: "Progress Mind Care",
            title: "Psychiatric Clinic",
            address: "8/1A, Hati Bagan Road, CIT Rd, Paddapukur, Entally, Kolkata",
            phone: "062922 67147",
            calendlyLink: "https://calendly.com/progress-mind-care" // Placeholder
        },
        {
            id: 5,
            name: "Moumita Ganguly",
            title: "Psychologist",
            address: "Dumdum M'S Clinic, 1/4 Nritya Gopal Chatterjee Lane, Paikpara (near Dumdum Station), Kolkata",
            phone: "099034 78519",
            calendlyLink: "https://calendly.com/moumita-ganguly" // Placeholder
        }
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-grow container mx-auto px-6 py-24">
                <div className="max-w-4xl mx-auto mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                        Professional Support
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Connect with qualified mental health professionals for personalized care and guidance.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {doctors.map((doctor) => (
                        <Card key={doctor.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="font-display text-xl">{doctor.name}</CardTitle>
                                <CardDescription className="text-primary font-medium">{doctor.title}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                                    <span>{doctor.address}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Phone className="w-4 h-4 flex-shrink-0" />
                                    <span>{doctor.phone}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-6 border-t bg-card/50">
                                <Button asChild className="w-full gap-2">
                                    <a href={doctor.calendlyLink} target="_blank" rel="noopener noreferrer">
                                        <Calendar className="w-4 h-4" />
                                        Book Appointment
                                    </a>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DoctorsPage;
