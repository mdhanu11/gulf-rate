import React from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

// Define the form schema
const formSchema = z.object({
  fullName: z.string().min(2, {
    message: 'Full name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  countryCode: z.string().min(1, {
    message: 'Please select a country code.',
  }),
  phone: z.string().min(9, {
    message: 'Phone number must be at least 9 digits.',
  }),
  fromCurrency: z.string().min(1, {
    message: 'Please select a from currency.',
  }),
  toCurrency: z.string().min(1, {
    message: 'Please select a to currency.',
  }),
  targetRate: z.string().optional(),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must agree to receive alerts.',
  }),
});

const countryCodes = [
  { value: '+966', label: '+966 (Saudi Arabia)' },
  { value: '+971', label: '+971 (UAE)' },
  { value: '+974', label: '+974 (Qatar)' },
  { value: '+965', label: '+965 (Kuwait)' },
  { value: '+973', label: '+973 (Bahrain)' },
  { value: '+968', label: '+968 (Oman)' },
  { value: '+91', label: '+91 (India)' },
  { value: '+92', label: '+92 (Pakistan)' },
  { value: '+63', label: '+63 (Philippines)' },
  { value: '+880', label: '+880 (Bangladesh)' },
  { value: '+977', label: '+977 (Nepal)' },
  { value: '+20', label: '+20 (Egypt)' },
];

const currencies = [
  { value: 'SAR', label: 'SAR - Saudi Riyal' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'PKR', label: 'PKR - Pakistani Rupee' },
  { value: 'PHP', label: 'PHP - Philippine Peso' },
  { value: 'BDT', label: 'BDT - Bangladeshi Taka' },
  { value: 'NPR', label: 'NPR - Nepalese Rupee' },
  { value: 'EGP', label: 'EGP - Egyptian Pound' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
];

// Type for form values
type FormValues = z.infer<typeof formSchema>;

const LeadCaptureForm: React.FC = () => {
  const { t } = useTranslation();
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      countryCode: '+966',
      phone: '',
      fromCurrency: 'SAR',
      toCurrency: 'INR',
      targetRate: '',
      consent: false,
    },
  });
  
  // Mutation for form submission
  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      return apiRequest('POST', '/api/leads', values);
    },
    onSuccess: () => {
      toast({
        title: t('leadCapture.success.title'),
        description: t('leadCapture.success.message'),
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t('leadCapture.error.title'),
        description: t('leadCapture.error.message'),
        variant: 'destructive',
      });
      console.error('Form submission error:', error);
    },
  });

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <section id="alerts" className="py-12 bg-gradient-primary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold font-inter">{t('alerts.title')}</h2>
            <p className="mt-3 text-white text-opacity-90">{t('alerts.subtitle')}</p>
          </div>
          
          <Card id="contact" className="p-6 md:p-8 text-gray-800">
            <div className="flex flex-col md:flex-row md:space-x-8">
              <div className="md:w-1/2 mb-6 md:mb-0">
                <h3 className="text-xl font-bold mb-4 text-gray-900">{t('leadCapture.title')}</h3>
                <p className="text-gray-600 mb-6">{t('leadCapture.description')}</p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500">
                      <i className="fas fa-bell"></i>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{t('leadCapture.features.0.title')}</h4>
                      <p className="text-xs text-gray-500">{t('leadCapture.features.0.description')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500">
                      <i className="fas fa-newspaper"></i>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{t('leadCapture.features.1.title')}</h4>
                      <p className="text-xs text-gray-500">{t('leadCapture.features.1.description')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500">
                      <i className="fas fa-percent"></i>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{t('leadCapture.features.2.title')}</h4>
                      <p className="text-xs text-gray-500">{t('leadCapture.features.2.description')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  {t('leadCapture.privacy')} 
                  <a href="#" className="text-primary-600 hover:text-primary-800">{t('leadCapture.privacyLink')}</a>.
                </div>
              </div>
              
              <div className="md:w-1/2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('leadCapture.form.name')}</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('leadCapture.form.email')}</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-5 gap-2">
                      <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>{t('leadCapture.form.countryCode')}</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('leadCapture.form.selectCountryCode')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countryCodes.map(code => (
                                  <SelectItem key={code.value} value={code.value}>
                                    {code.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="col-span-3">
                            <FormLabel>{t('leadCapture.form.phone')}</FormLabel>
                            <FormControl>
                              <Input placeholder="555123456" type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
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
                            <FormLabel>{t('leadCapture.form.fromCurrency')}</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('leadCapture.form.selectCurrency')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {currencies.map(currency => (
                                  <SelectItem key={currency.value} value={currency.value}>
                                    {currency.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="toCurrency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('leadCapture.form.toCurrency')}</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('leadCapture.form.selectCurrency')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {currencies.filter(c => c.value !== 'SAR').map(currency => (
                                  <SelectItem key={currency.value} value={currency.value}>
                                    {currency.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="targetRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('leadCapture.form.targetRate')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 22.50" 
                              type="number" 
                              step="0.01" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm text-gray-600">
                              {t('leadCapture.form.consent')}
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          {t('common.submitting')}
                        </>
                      ) : (
                        t('leadCapture.form.submit')
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
