import React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

// Define the form schema
const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  countryCode: z.string().min(1, {
    message: "Please select a country code.",
  }),
  phone: z.string().min(9, {
    message: "Phone number must be at least 9 digits.",
  }),
  fromCurrency: z.string().min(1, {
    message: "Please select a from currency.",
  }),
  toCurrency: z.string().min(1, {
    message: "Please select a to currency.",
  }),
  targetRate: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to receive alerts.",
  }),
});

const countryCodes = [
  { value: "+966", label: "+966 (Saudi Arabia)" },
  { value: "+971", label: "+971 (UAE)" },
  { value: "+974", label: "+974 (Qatar)" },
  { value: "+965", label: "+965 (Kuwait)" },
  { value: "+973", label: "+973 (Bahrain)" },
  { value: "+968", label: "+968 (Oman)" },
  { value: "+91", label: "+91 (India)" },
  { value: "+92", label: "+92 (Pakistan)" },
  { value: "+63", label: "+63 (Philippines)" },
  { value: "+880", label: "+880 (Bangladesh)" },
  { value: "+977", label: "+977 (Nepal)" },
  { value: "+20", label: "+20 (Egypt)" },
];

const currencies = [
  { value: "SAR", label: "SAR - Saudi Riyal" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "PKR", label: "PKR - Pakistani Rupee" },
  { value: "PHP", label: "PHP - Philippine Peso" },
  { value: "BDT", label: "BDT - Bangladeshi Taka" },
  { value: "NPR", label: "NPR - Nepalese Rupee" },
  { value: "EGP", label: "EGP - Egyptian Pound" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
];

// Type for form values
type FormValues = z.infer<typeof formSchema>;

const LeadCaptureForm: React.FC = () => {
  const { t } = useTranslation();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      countryCode: "+966",
      phone: "",
      fromCurrency: "SAR",
      toCurrency: "INR",
      targetRate: "",
      consent: false,
    },
  });

  // Mutation for form submission
  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      return apiRequest("POST", "/api/leads", values);
    },
    onSuccess: () => {
      toast({
        title: t("leadCapture.success.title"),
        description: t("leadCapture.success.message"),
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t("leadCapture.error.title"),
        description: t("leadCapture.error.message"),
        variant: "destructive",
      });
      console.error("Form submission error:", error);
    },
  });

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <section id="alerts" className="relative py-16 overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-800 to-blue-900 opacity-95"></div>

      {/* Currency symbols as decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-8xl">$</div>
        <div className="absolute top-40 right-20 text-7xl">₹</div>
        <div className="absolute bottom-20 left-1/4 text-9xl">€</div>
        <div className="absolute top-1/3 left-2/3 text-6xl">£</div>
        <div className="absolute bottom-40 right-1/4 text-8xl">¥</div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {t("alerts.title")}
          </h2>
          <div className="h-1 w-20 bg-yellow-400 mx-auto my-4 rounded-full"></div>
          <p className="mt-4 text-blue-100 max-w-2xl mx-auto text-lg">
            {t("alerts.subtitle")}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden shadow-2xl">
            <div className="flex flex-col md:flex-row">
              {/* Feature Column */}
              <div className="md:w-5/12 bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold">
                      {t("leadCapture.title")}
                    </h3>
                  </div>
                </div>

                <p className="text-blue-100 mb-8">
                  {t("leadCapture.description")}
                </p>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-blue-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-white">
                        {t("leadCapture.features.0.title")}
                      </h4>
                      <p className="text-blue-100 text-sm">
                        {t("leadCapture.features.0.description")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-blue-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-white">
                        {t("leadCapture.features.1.title")}
                      </h4>
                      <p className="text-blue-100 text-sm">
                        {t("leadCapture.features.1.description")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-blue-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-white">
                        {t("leadCapture.features.2.title")}
                      </h4>
                      <p className="text-blue-100 text-sm">
                        {t("leadCapture.features.2.description")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-blue-100 pb-6 border-t border-blue-400 pt-6">
                  {t("leadCapture.privacy")}
                  <a
                    href="#"
                    className="text-yellow-300 hover:text-yellow-200 underline"
                  >
                    {t("leadCapture.privacyLink")}
                  </a>
                  .
                </div>
              </div>

              {/* Form Column */}
              <div className="md:w-7/12 p-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500 inline mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {t("leadCapture.form.submit")}
                </h3>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            {t("leadCapture.form.name")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              {...field}
                              className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            {t("leadCapture.form.email")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="john@example.com"
                              type="email"
                              {...field}
                              className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-5 gap-3">
                      <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel className="text-gray-700">
                              {t("leadCapture.form.countryCode")}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition">
                                  <SelectValue
                                    placeholder={t(
                                      "leadCapture.form.selectCountryCode"
                                    )}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countryCodes.map((code) => (
                                  <SelectItem
                                    key={code.value}
                                    value={code.value}
                                  >
                                    {code.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="col-span-3">
                            <FormLabel className="text-gray-700">
                              {t("leadCapture.form.phone")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="555123456"
                                type="tel"
                                {...field}
                                className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fromCurrency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              {t("leadCapture.form.fromCurrency")}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition">
                                  <SelectValue
                                    placeholder={t(
                                      "leadCapture.form.selectCurrency"
                                    )}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {currencies.map((currency) => (
                                  <SelectItem
                                    key={currency.value}
                                    value={currency.value}
                                  >
                                    {currency.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="toCurrency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              {t("leadCapture.form.toCurrency")}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition">
                                  <SelectValue
                                    placeholder={t(
                                      "leadCapture.form.selectCurrency"
                                    )}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {currencies
                                  .filter((c) => c.value !== "SAR")
                                  .map((currency) => (
                                    <SelectItem
                                      key={currency.value}
                                      value={currency.value}
                                    >
                                      {currency.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="targetRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            {t("leadCapture.form.targetRate")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 22.50"
                              type="number"
                              step="0.01"
                              {...field}
                              className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm text-gray-600">
                              {t("leadCapture.form.consent")}
                            </FormLabel>
                            <FormMessage className="text-red-500" />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-4 transition-colors mt-2"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {t("common.submitting")}
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2 inline"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                          {t("leadCapture.form.submit")}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LeadCaptureForm;
