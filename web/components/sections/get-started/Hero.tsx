
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Hero() {
  return (
    <section className="bg-[#060e0f]">
      <div className="mx-auto grid max-w-7xl items-center py-32 md:grid md:grid-cols-[60%_40%] md:py-62">
        {/* Left side */}
        <div>
          <h1 className="text-5xl font-normal leading-[1.05] tracking-[-0.04em] text-white md:text-[82px]">
            Authenticate CLI
          </h1>

          <p className="mt-4 max-w-xl text-lg font-base leading-relaxed text-white md:text-4xl">
            Generate your access token
          </p>
        </div>

        {/* Right side */}
        <div>
          <Card className="bg-white text-[#0a0a0a] shadow-2xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-medium text-center">
                Connect to Orcyn
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form className="space-y-5">
                <div className="space-y-2">
                  <Input
                    type="name"
                    placeholder="Name"
                    className="h-12 border border-[#bdc6c7] bg-white/5 text-black placeholder:text-[#545d5e]"
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    className="h-12 border border-[#bdc6c7] bg-white/5 text-black placeholder:text-[#545d5e]"
                  />
                </div>

                <Button className="h-12 w-full bg-[#0a0a0a] text-white hover:bg-black/90">
                  Generate token
                </Button>

              
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
